-- Form Builder Tables
CREATE TABLE IF NOT EXISTS _form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  table_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE _form_schemas ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage all form schemas"
ON _form_schemas FOR ALL
USING (has_role('admin'));

-- Managers can view and create
CREATE POLICY "Managers can view and create form schemas"
ON _form_schemas FOR SELECT
USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Managers can create form schemas"
ON _form_schemas FOR INSERT
WITH CHECK (has_role('manager') OR has_role('admin'));

-- Users can only view
CREATE POLICY "Users can view form schemas"
ON _form_schemas FOR SELECT
USING (has_role('user') OR has_role('manager') OR has_role('admin'));

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_schemas_updated_at
  BEFORE UPDATE ON _form_schemas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Form Data Table (stores all form submissions as JSON)
CREATE TABLE IF NOT EXISTS _form_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_schema_id UUID REFERENCES _form_schemas(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for form data
ALTER TABLE _form_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their form data"
ON _form_data FOR ALL
USING (has_role('admin') OR has_role('manager') OR (has_role('user') AND submitted_by = auth.uid()));

CREATE TRIGGER update_form_data_updated_at
  BEFORE UPDATE ON _form_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample form schema
INSERT INTO _form_schemas (name, description, schema, table_name) VALUES
('Product Form', 'Basic product form', '{
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Product Name",
      "required": true,
      "validation": {
        "minLength": 1,
        "maxLength": 100
      }
    },
    {
      "name": "price",
      "type": "number",
      "label": "Price",
      "required": true,
      "validation": {
        "min": 0,
        "step": 0.01
      }
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "Description",
      "required": false
    },
    {
      "name": "category",
      "type": "select",
      "label": "Category",
      "required": true,
      "options": [
        {"value": "electronics", "label": "Electronics"},
        {"value": "clothing", "label": "Clothing"},
        {"value": "books", "label": "Books"}
      ]
    }
  ]
}', 'products');