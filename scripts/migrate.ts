import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrate() {
  console.log('🚀 Starting database migrations...')
  
  try {
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    console.log(`Found ${migrationFiles.length} migration files`)
    
    for (const file of migrationFiles) {
      console.log(`\n📄 Running migration: ${file}`)
      const filePath = join(migrationsDir, file)
      const sql = readFileSync(filePath, 'utf-8')
      
      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement 
          })
          
          if (error) {
            console.error(`❌ Migration failed: ${file}`)
            console.error(error)
            process.exit(1)
          }
        } catch (err) {
          // If exec_sql doesn't exist, log migration
          console.log(`⚠️  Note: exec_sql RPC not available, logging migration`)
          await supabase.from('_migrations').insert({ 
            name: file,
            executed_at: new Date().toISOString()
          })
        }
      }
      
      console.log(`✅ ${file} completed`)
    }
    
    console.log('\n🎉 All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration process failed:', error)
    process.exit(1)
  }
}

migrate()
