# Database Migrations

This guide explains how to work with TypeORM migrations in this NestJS application.

## Prerequisites

Make sure you have your environment variables set up properly in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
NODE_ENV=development
DB_SYNC=false  # Set to false when using migrations
DB_SSL=false   # Set to true if your database requires SSL
```

## Quick Setup

For first-time setup, use the automated setup script:

```powershell
npm run db:setup
```

This script will:
1. Check your environment configuration
2. Show current migration status
3. Run all pending migrations
4. Provide next steps

## Migration Scripts

The following npm scripts are available for managing migrations:

### Generate a New Migration

```powershell
npm run migration:generate -- src/migrations/YourMigrationName
```

This command will compare your current entities with the database schema and generate a migration file with the necessary changes.

### Run Migrations

```powershell
npm run migration:run
```

Executes all pending migrations against the database.

### Revert Last Migration

```powershell
npm run migration:revert
```

Reverts the last executed migration.

### Show Migration Status

```powershell
npm run migration:show
```

Shows which migrations have been executed and which are pending.

### Create Empty Migration

```powershell
npm run migration:create -- src/migrations/YourMigrationName
```

Creates an empty migration file that you can modify manually.

## Migration Workflow

### Initial Setup

1. **Create your first migration** (if starting fresh):
   ```powershell
   npm run migration:generate -- src/migrations/InitialSchema
   ```

2. **Run the migration**:
   ```powershell
   npm run migration:run
   ```

3. **Or use the automated setup**:
   ```powershell
   npm run db:setup
   ```

### Making Schema Changes

1. **Modify your entities** as needed
2. **Generate a migration**:
   ```powershell
   npm run migration:generate -- src/migrations/DescriptiveNameForYourChanges
   ```
3. **Review the generated migration** to ensure it's correct
4. **Run the migration**:
   ```powershell
   npm run migration:run
   ```

## Best Practices

1. **Always review generated migrations** before running them
2. **Use descriptive names** for your migrations
3. **Test migrations** on a development database first
4. **Keep migrations small and focused** on specific changes
5. **Never edit existing migration files** that have been run in production
6. **Backup your database** before running migrations in production

## Environment-Specific Behavior

- **Development**: 
  - Set `DB_SYNC=false` to use migrations instead of auto-sync
  - Migrations provide better control over schema changes
  
- **Production**: 
  - `synchronize` is disabled
  - `migrationsRun` is enabled to automatically run pending migrations on startup
  - Always test migrations in staging environment first

## Troubleshooting

### Migration Already Exists Error

If you get an error about a migration already existing, check the `migrations` table in your database and ensure your migration files are in sync.

### Schema Drift

If your database schema doesn't match your migrations, you may need to:

1. Backup your data
2. Drop and recreate the database
3. Run all migrations from the beginning

### Rolling Back Multiple Migrations

TypeORM only supports reverting one migration at a time. To revert multiple migrations:

```powershell
npm run migration:revert  # Revert migration 3
npm run migration:revert  # Revert migration 2
npm run migration:revert  # Revert migration 1
```

## Included Migrations

The starter project includes these initial migrations:

1. **InitialSchema** - Creates the core database structure:
   - `users` table with authentication and profile fields
   - `roles` table for role-based access control
   - `permissions` table for granular permissions
   - Junction tables for many-to-many relationships
   - Default roles: super-admin, admin, user

2. **SeedRolePermissions** - Assigns default permissions to roles:
   - Super-admin gets all permissions
   - Admin gets user and role management permissions
   - User gets basic read/update permissions

## Environment Variables Reference

```env
# Database Configuration
DB_HOST=localhost                    # Database host
DB_PORT=5432                        # Database port
DB_USERNAME=postgres                # Database username
DB_PASSWORD=password                # Database password
DB_NAME=nestjs_oauth               # Database name
DB_SSL=false                       # Enable SSL connection
DB_SYNC=false                      # Disable auto-sync when using migrations

# Application Settings
NODE_ENV=development               # Environment (development/production)
JWT_SECRET=your-secret-key         # JWT signing secret
```
