# คู่มือเริ่มต้นใช้งาน Boilerplate

## 📋 สารบัญ
1. [ติดตั้งและตั้งค่าเบื้องต้น](#1-ติดตั้งและตั้งค่าเบื้องต้น)
2. [สร้าง Feature ใหม่](#2-สร้าง-feature-ใหม่)
3. [เพิ่มหน้าใหม่](#3-เพิ่มหน้าใหม่)
4. [จัดการ Permissions](#4-จัดการ-permissions)
5. [เพิ่มภาษาใหม่](#5-เพิ่มภาษาใหม่)
6. [Deploy Production](#6-deploy-production)

---

## 1. ติดตั้งและตั้งค่าเบื้องต้น

### 1.1 ติดตั้ง Dependencies
```bash
bun install
```

### 1.2 ตั้งค่า Supabase
1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
2. คัดลอก `.env.example` เป็น `.env.local`
3. เพิ่มค่า environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 สร้าง Admin User แรก
```bash
node setup-admin.js
```
หรือตั้งค่าผ่าน Supabase Dashboard:
- Authentication → Users → เลือก user
- แก้ไข **Raw User Meta Data**:
```json
{
  "roles": ["admin"]
}
```

### 1.4 รัน Development Server
```bash
bun dev
```
เปิด [http://localhost:3000](http://localhost:3000)

---

## 2. สร้าง Feature ใหม่

### 2.1 สร้างโครงสร้างโฟลเดอร์
```bash
mkdir -p app/[locale]/(dashboard)/products/_components
mkdir -p app/[locale]/(dashboard)/products/_lib
```

### 2.2 สร้างไฟล์พื้นฐาน

**`app/[locale]/(dashboard)/products/_lib/types.ts`**
```typescript
export interface Product {
  id: string
  name: string
  price: number
  created_at: string
}
```

**`app/[locale]/(dashboard)/products/_lib/queries.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

**`app/[locale]/(dashboard)/products/_lib/actions.ts`**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('products').insert({
    name: formData.get('name'),
    price: Number(formData.get('price'))
  })
  
  if (error) return { error: error.message }
  
  revalidatePath('/products')
  return { success: true }
}
```

**`app/[locale]/(dashboard)/products/page.tsx`**
```typescript
import { getProducts } from './_lib/queries'

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="p-4 border rounded">
            <h2>{product.name}</h2>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 2.3 เพิ่มเข้า Sidebar
แก้ไข `components/sidebar.tsx`:
```tsx
import { Package } from 'lucide-react'

// เพิ่มใน nav section
<Link 
  href={`/${locale}/products`} 
  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    pathname === `/${locale}/products` 
      ? 'bg-[hsl(var(--color-accent))]' 
      : 'hover:bg-[hsl(var(--color-accent))]'
  } ${collapsed ? 'justify-center' : ''}`}
>
  <Package className="h-5 w-5" />
  {!collapsed && 'Products'}
</Link>
```

### 2.4 เพิ่มคำแปล
**`messages/en.json`**
```json
{
  "products": {
    "title": "Products",
    "create": "Create Product",
    "name": "Product Name",
    "price": "Price"
  }
}
```

**`messages/th.json`**
```json
{
  "products": {
    "title": "สินค้า",
    "create": "สร้างสินค้า",
    "name": "ชื่อสินค้า",
    "price": "ราคา"
  }
}
```

---

## 3. เพิ่มหน้าใหม่

### 3.1 หน้าแบบ Static
```typescript
// app/[locale]/(dashboard)/about/page.tsx
export default function AboutPage() {
  return <div>About Page</div>
}
```

### 3.2 หน้าแบบ Dynamic Route
```typescript
// app/[locale]/(dashboard)/products/[id]/page.tsx
interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  // Fetch product by id
  return <div>Product {id}</div>
}
```

### 3.3 หน้าที่มี Sub-routes
```
products/
├── page.tsx              # /products
├── new/
│   └── page.tsx          # /products/new
└── [id]/
    ├── page.tsx          # /products/[id]
    └── edit/
        └── page.tsx      # /products/[id]/edit
```

---

## 4. จัดการ Permissions

### 4.1 ป้องกันหน้าทั้งหมด (Server Component)
```typescript
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/permissions'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!isAdmin(user)) {
    redirect('/dashboard')
  }
  
  return <div>Admin Only Content</div>
}
```

### 4.2 ป้องกันบางส่วน (Client Component)
```typescript
'use client'

import { RoleGuard } from '@/app/[locale]/(dashboard)/users/_components/role-guard'

export function AdminPanel() {
  return (
    <RoleGuard requiredRoles={['admin']} fallback={<div>Access Denied</div>}>
      <button>Delete All</button>
    </RoleGuard>
  )
}
```

### 4.3 ตรวจสอบ Permission ใน Server Action
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/permissions'

export async function deleteAllProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!isAdmin(user)) {
    return { error: 'Unauthorized' }
  }
  
  // Delete logic
}
```

### 4.4 Row Level Security (RLS)
```sql
-- สร้าง function ตรวจสอบ role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT required_role = ANY(
      COALESCE(
        (auth.jwt() -> 'app_metadata' -> 'roles')::jsonb::text[],
        '{}'::text[]
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ใช้ใน Policy
CREATE POLICY "Admin only"
ON products FOR ALL
USING (auth.user_has_role('admin'));
```

---

## 5. เพิ่มภาษาใหม่

### 5.1 เพิ่ม Locale ใน Config
แก้ไข `i18n.ts`:
```typescript
export const locales = ['en', 'th', 'ja'] as const // เพิ่ม 'ja'
```

### 5.2 สร้างไฟล์แปล
```bash
cp messages/en.json messages/ja.json
```

แก้ไข `messages/ja.json`:
```json
{
  "dashboard": {
    "title": "ダッシュボード",
    "overview": "概要"
  }
}
```

### 5.3 เพิ่มปุ่มสลับภาษา
แก้ไข `components/sidebar.tsx`:
```tsx
const localeNames = { en: 'EN', th: 'ไทย', ja: '日本語' }

<Button onClick={switchLocale}>
  {localeNames[locale]}
</Button>
```

---

## 6. Deploy Production

### 6.1 Build
```bash
bun run build
```

### 6.2 Deploy to Vercel
```bash
vercel
```

หรือ push ไป GitHub และเชื่อมต่อกับ Vercel Dashboard

### 6.3 ตั้งค่า Environment Variables
ใน Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 6.4 ตั้งค่า Supabase Redirect URLs
ใน Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://your-domain.com
Redirect URLs: https://your-domain.com/auth/callback
```

---

## 📚 เอกสารเพิ่มเติม

- [STRUCTURE.md](STRUCTURE.md) - โครงสร้างโปรเจกต์
- [PERMISSIONS.md](PERMISSIONS.md) - ระบบ RBAC
- [README.md](README.md) - ภาพรวมโปรเจกต์

## 🆘 แก้ปัญหา

### ปัญหา: Login แล้วไม่ redirect
- ตรวจสอบ `middleware.ts` ว่ามี route ที่ถูกต้อง
- ตรวจสอบ Supabase URL Configuration

### ปัญหา: Permission ไม่ทำงาน
- ตรวจสอบว่า user มี `app_metadata.roles` ใน Supabase
- ตรวจสอบ RLS policies ใน Supabase

### ปัญหา: Build error
```bash
rm -rf .next
bun install
bun run build
```

---

## 💡 Tips

1. **ใช้ Feature-Colocation** - เก็บทุกอย่างของ feature ไว้ในโฟลเดอร์เดียว
2. **ตั้งชื่อโฟลเดอร์ด้วย `_`** - เพื่อไม่ให้ Next.js สร้าง route
3. **ใช้ Server Components** - เร็วกว่าและปลอดภัยกว่า
4. **ใช้ RLS** - ป้องกันข้อมูลที่ database level
5. **Test ทุก Permission** - ทั้ง UI และ API level
