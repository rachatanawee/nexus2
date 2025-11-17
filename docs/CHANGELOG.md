# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2026-11-17

### Added
- PDF report generation with React-PDF
- Shared PDF library (styles, components, utilities)
- Reusable PDF components (PDFHeader, PDFTable, PDFFooter)
- Product list PDF report template
- Fixed table headers in PDF (display on every page)
- Dynamic theme switching with CSS files
- Theme loader component for client-side theme updates

### Changed
- Settings form now reloads page after save to apply theme changes
- Settings query now orders by ID instead of category
- Sticky table headers implementation improved

### Fixed
- Toast notification showing multiple times on settings save
- Theme not changing when updating theme_name setting
- Table headers not freezing on scroll
- Settings fields reordering randomly

## [0.4.0] - 2026-01-17

### Added
- Modern DataTable with TanStack Table v8
- Column resizing with drag handles
- Sticky table headers with scroll
- Column visibility toggle
- Export to Excel functionality
- Advanced pagination (page size, first/last)
- Row selection support
- Faceted filters
- Search with reset filters
- Date formatting with preference cache
- New CRUD generator (v3) using modern DataTable

### Changed
- Replaced complex DataTable with simple TanStack Table wrapper
- Updated all tables (users, categories, products) to new DataTable
- CRUD generator now uses columns pattern instead of getColumns
- Simplified table components (no fetchData, exportConfig)

### Removed
- Old data-table directory with complex implementation
- Old CRUD generator scripts (v1, v2)

## [0.3.0] - 2025-01-17

### Added
- Page transition with loading state and fade-in animation
- Error handling system with Supabase error details
- Rate limiting utility for API routes
- Docker deployment support (Dockerfile, docker-compose.yml)
- Consolidated documentation (GUIDE.md)
- Admin user protection (cannot delete last admin)
- Boolean field handling in CRUD generator
- Global error boundary and 404 page

### Changed
- Converted scripts to ES modules
- Improved CRUD generator with boolean type support
- Consolidated docs from 10 files to 7 files
- Enhanced user deletion with admin count validation
- Removed duplicate page refresh on user creation

### Fixed
- React hooks error from permission checks in page components
- Boolean field type errors in generated forms
- Double refresh issue on user create/delete
- Supabase error messages now show details and hints
- TypeScript 'any' type warnings in layout

## [0.2.0] - 2024-12-25

### Added
- Next.js 16 with App Router
- Supabase authentication with cookie-based sessions
- Role-based access control (RBAC) system
- Multi-language support (EN/TH) with next-intl
- Admin dashboard with collapsible sidebar
- User management with role assignment
- TanStack Table with sorting, pagination, filtering
- CRUD generator for automatic feature creation
- Feature-colocation architecture pattern
- Route guards with middleware protection
- shadcn/ui components integration
- Tailwind CSS v4 styling
- TypeScript throughout the project

### Security
- Row Level Security (RLS) policies
- Server-side permission checks
- Client-side role guards
- Secure session management
- Input validation and sanitization

### Documentation
- Comprehensive README
- Getting started guide
- Project structure documentation
- Permissions and RBAC guide
- Contributing guidelines

## [0.1.0] - 2024-12-01

### Added
- Initial project setup
- Basic authentication flow
- Dashboard layout structure
- User table implementation
- Basic CRUD operations

---

## Migration Notes

### From 0.x to 1.0.0

#### Database Changes
1. Run the complete database setup:
   ```sql
   -- Run db/complete_setup.sql in Supabase SQL Editor
   ```

2. Update existing system tables (if any):
   ```sql
   ALTER TABLE app_settings RENAME TO _app_settings;
   ALTER TABLE user_preferences RENAME TO _user_preferences;
   ```

#### Code Changes
1. Update imports for system tables:
   ```typescript
   // Before
   .from('app_settings')
   
   // After  
   .from('_app_settings')
   ```

2. Add PreferencesProvider to your app:
   ```tsx
   <PreferencesProvider>
     <App />
   </PreferencesProvider>
   ```

#### Environment Variables
No changes required for environment variables.

### Breaking Changes

#### v1.0.0
- System tables now use `_` prefix
- Format utilities moved to centralized system
- Preferences caching requires context provider

#### v0.1.0
- Initial release, no breaking changes

---

## Upgrade Guide

### To v1.0.0

1. **Backup your database** before making changes

2. **Update system tables:**
   ```sql
   -- Only if you have existing tables
   ALTER TABLE app_settings RENAME TO _app_settings;
   ALTER TABLE user_preferences RENAME TO _user_preferences;
   ```

3. **Run new setup script:**
   ```bash
   # Run db/complete_setup.sql in Supabase SQL Editor
   ```

4. **Update your code:**
   ```typescript
   // Update all references to system tables
   supabase.from('_app_settings') // instead of 'app_settings'
   supabase.from('_user_preferences') // instead of 'user_preferences'
   ```

5. **Add context provider:**
   ```tsx
   // In your root layout
   <PreferencesProvider>
     {children}
   </PreferencesProvider>
   ```

6. **Test your application:**
   - Verify settings page works
   - Check user preferences
   - Test format system
   - Confirm CRUD operations

---

## Support

### Getting Help
- Check the [documentation](../README.md)
- Search [existing issues](https://github.com/your-repo/issues)
- Create a [new issue](https://github.com/your-repo/issues/new)

### Reporting Bugs
When reporting bugs, please include:
- Version number
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment details

### Feature Requests
For feature requests, please:
- Check if it already exists
- Describe the use case
- Explain the expected behavior
- Consider contributing the feature

---

## Contributors

Thanks to all contributors who have helped make this project better!

- [@your-username](https://github.com/your-username) - Project creator and maintainer

---

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.