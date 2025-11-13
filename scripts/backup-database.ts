import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function backupDatabase() {
  console.log('🔄 Starting database backup...')
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = join(process.cwd(), 'backups')
    
    // Tables to backup
    const tables = [
      'users',
      'courses',
      'enrollments',
      'assignments',
      'quizzes',
      'live_classes',
      'payments',
      'notifications',
      'support_tickets',
      'email_logs'
    ]
    
    const backup: Record<string, any[]> = {}
    
    for (const table of tables) {
      console.log(`📦 Backing up table: ${table}`)
      const { data, error } = await supabase
        .from(table)
        .select('*')
      
      if (error) {
        console.warn(`⚠️  Warning: Could not backup ${table}:`, error.message)
        continue
      }
      
      backup[table] = data || []
      console.log(`✅ Backed up ${data?.length || 0} records from ${table}`)
    }
    
    const backupFile = join(backupDir, `backup-${timestamp}.json`)
    writeFileSync(backupFile, JSON.stringify(backup, null, 2))
    
    console.log(`\n🎉 Backup completed: ${backupFile}`)
    console.log(`📊 Total tables backed up: ${Object.keys(backup).length}`)
  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

backupDatabase()
