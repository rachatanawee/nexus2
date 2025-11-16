# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- System tables with `_` prefix for better organization
- App settings and user preferences system
- Format system with number and date formatting
- Preferences caching with React Context
- Profile management with user metadata
- Enhanced CRUD generator with format integration
- Comprehensive documentation

### Changed
- Updated table naming convention (system tables use `_` prefix)
- Improved CRUD generator with fallback schemas
- Enhanced format system with user preferences
- Better error handling in build process

### Fixed
- TypeScript build errors
- Server/client component issues
- Format preferences not updating in real-time

## [1.0.0] - 2024-12-25

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