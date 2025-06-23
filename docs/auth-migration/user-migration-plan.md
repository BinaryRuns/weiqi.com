# User Migration Plan

## Data Mapping

| Current Schema | Supabase Auth |
|--------------|--------------|
| `id` | (not migrated - internal) |
| `userId` | `id` (UUID in Supabase auth.users) |
| `username` | `raw_user_meta_data->username` or profile table |
| `email` | `email` |
| `passwordHash` | `encrypted_password` (needs conversion) |
| `skillLevel` | `raw_user_meta_data->skill_level` |
| `createdAt` | `created_at` |

## Migration Steps

### 1. Export Users Script

```sql
-- Export script to retrieve users in a format compatible with Supabase
SELECT 
  userId, 
  username, 
  email, 
  passwordHash,
  skillLevel,
  createdAt
FROM 
  users
```

### 2. Create Migration Environment

1. Set up a secure environment for the migration
2. Install Supabase CLI/SDK
3. Install migration dependencies:
   ```bash
   npm install @supabase/supabase-js bcrypt
   ```

### 3. User Import Script

Create a Node.js script (`migrate-users.js`) to:
1. Read exported user data
2. Convert password hashes if needed
3. Create users in Supabase
4. Set up metadata and profiles

```javascript
// migrate-users.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase Admin client 
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service key, not anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Read user data from JSON file
const users = JSON.parse(fs.readFileSync('exported-users.json', 'utf8'));

async function migrateUsers() {
  console.log(`Starting migration of ${users.length} users`);
  
  for (const user of users) {
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: null, // Don't set password directly
        email_confirm: true,
        user_metadata: {
          username: user.username,
          skill_level: user.skillLevel,
          migrated_from_legacy: true
        },
        app_metadata: {
          provider: 'email',
          legacy_user_id: user.userId
        }
      });
      
      if (error) throw error;
      
      console.log(`Migrated user: ${user.email}`);
      
      // Create profile entry
      await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          username: user.username,
          skill_level: user.skillLevel,
          created_at: user.createdAt
        });
        
    } catch (error) {
      console.error(`Error migrating user ${user.email}:`, error.message);
    }
  }
  
  console.log('Migration completed');
}

migrateUsers();
```

### 4. Password Reset Requirement

Since we can't directly migrate BCrypt password hashes to Supabase's format, users will need to reset their passwords:

1. Create a temporary password for all migrated users
2. Send password reset emails to all users after migration
3. Force password change on first login

### 5. Verification Steps

- Verify user counts match between old system and Supabase
- Verify sample users have correct metadata
- Test login and password reset flow
- Verify OAuth connections

### 6. Rollback Plan

In case of issues:
1. Keep the original database intact
2. Be prepared to switch back to the original auth system
3. Have database snapshot before beginning migration

## Post-Migration Tasks

1. Update all foreign key references in the database to use new user IDs
2. Create a mapping table between old and new IDs if needed
3. Send email notification to users about the auth system change 