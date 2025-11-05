# Database Migrations

## How It Works

Database migrations run **before the Docker build** in the CI/CD pipeline:

```
Migrate DB → Build App → Deploy
```

This ensures:

- ✅ New schema is available when Next.js builds (for build-time data fetching)
- ✅ Migration failures prevent bad builds from being deployed
- ✅ Simple, straightforward workflow

## Migration Strategy

### For Non-Breaking Changes (Most cases)

Just create your migration and push - it will work seamlessly:

- Adding new tables
- Adding nullable columns
- Adding indexes
- Creating functions/triggers

### For Breaking Changes

Accept brief downtime (1-2 minutes) and notify users beforehand:

- Dropping columns
- Renaming columns
- Changing column types
- Adding NOT NULL constraints

**Before deploying breaking changes:**

1. Notify users about maintenance window
2. Push your changes
3. CI/CD will: migrate → build → deploy

## Creating Migrations

### Method 1: Manual Migration (Recommended for complex changes)

Write SQL directly in a migration file:

```bash
# Create a new migration file
supabase migration new add_employees_table

# Edit the generated file: supabase/migrations/<timestamp>_add_employees_table.sql
# Add your SQL:
#   create table public.employees (
#     id integer primary key generated always as identity,
#     name text
#   );

# Test locally
npm run supabase:reset

# Update TypeScript types
npm run supabase:types

# Commit both the migration and updated types
git add supabase/migrations/*.sql lib/supabase/database.types.ts
git commit -m "Add employees table"
```

You can also pipe SQL from stdin:

```bash
supabase migration new add_employees_table < create_employees_table.sql
```

### Method 2: Auto Schema Diff (Great for quick iterations)

Make changes in Supabase Studio UI, then generate a migration:

```bash
# 1. Start Supabase locally
npm run supabase:start

# 2. Open Studio at http://localhost:54323
#    Make your changes visually (create tables, columns, etc.)

# 3. Generate migration from the changes you made
supabase db diff -f add_employees_table

# 4. Review the generated migration file
#    Note: Auto-generated migrations are more verbose but include all grants/permissions

# 5. For a more concise migration (experimental), use migra:
supabase db diff -f add_employees_table --use-migra

# 6. Update TypeScript types
npm run supabase:types

# 7. Commit everything
git add supabase/migrations/*.sql lib/supabase/database.types.ts
git commit -m "Add employees table"
```

**Tip:** You can preview the diff without creating a file:

```bash
supabase db diff              # Output to stdout
supabase db diff --use-migra  # More concise output
```

## Pull Request CI

Every PR automatically:

- ✅ Tests migrations apply cleanly
- ✅ Verifies TypeScript types are up-to-date
- ❌ Fails if types are outdated (reminds you to regenerate)

This catches migration issues before they reach dev/prod!

## Best Practices

1. **Test in dev first** - dev environment deploys before production
2. **Keep migrations small** - easier to debug and rollback
3. **Make migrations idempotent** - use `IF NOT EXISTS`, `IF EXISTS`
4. **Document breaking changes** - add comments in the SQL file
5. **Always update types** - run `npm run supabase:types` after schema changes

## Rollback

If a deployment fails:

1. Fix the migration SQL
2. Push a new commit
3. CI/CD will retry with fixed migration

For emergency rollback:

1. Revert the commit
2. Push to trigger rollback deployment
3. Manually rollback database if needed
