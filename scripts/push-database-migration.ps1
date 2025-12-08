# ============================================================================
# Push Database Migration to Supabase
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Supabase Migration Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Supabase CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the manual method:" -ForegroundColor Yellow
    Write-Host "  1. Open https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. Click 'SQL Editor'" -ForegroundColor White
    Write-Host "  3. Copy FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql" -ForegroundColor White
    Write-Host "  4. Paste and click 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "See PUSH_DATABASE_TO_SUPABASE_GUIDE.md for details" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
supabase --version
Write-Host ""

# Check if project is linked
Write-Host "Checking Supabase project link..." -ForegroundColor Yellow
$configExists = Test-Path ".supabase/config.toml"

if (-not $configExists) {
    Write-Host "❌ Project not linked to Supabase!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please link your project:" -ForegroundColor Yellow
    Write-Host "  supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor White
    Write-Host ""
    Write-Host "Find your project ref at:" -ForegroundColor Cyan
    Write-Host "  https://supabase.com/dashboard/project/_/settings/general" -ForegroundColor White
    Write-Host ""
    
    $link = Read-Host "Would you like to link now? (y/n)"
    if ($link -eq "y" -or $link -eq "Y") {
        $projectRef = Read-Host "Enter your project ref"
        Write-Host ""
        Write-Host "Linking project..." -ForegroundColor Yellow
        supabase link --project-ref $projectRef
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to link project" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Project linked successfully" -ForegroundColor Green
    } else {
        exit 1
    }
} else {
    Write-Host "✅ Project linked" -ForegroundColor Green
}
Write-Host ""

# Check migration status
Write-Host "Checking migration status..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Remote migrations:" -ForegroundColor Cyan
supabase db remote list
Write-Host ""

# Ask user to confirm
Write-Host "Ready to push migrations to Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will apply:" -ForegroundColor Cyan
Write-Host "  • Fix notifications RLS policies" -ForegroundColor White
Write-Host "  • Grant proper permissions" -ForegroundColor White
Write-Host "  • Add performance indexes" -ForegroundColor White
Write-Host "  • Fix notification_preferences table" -ForegroundColor White
Write-Host "  • Fix push_subscriptions table" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Cancelled by user" -ForegroundColor Yellow
    exit 0
}

# Push migrations
Write-Host ""
Write-Host "Pushing migrations to Supabase..." -ForegroundColor Yellow
Write-Host ""

try {
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migrations pushed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Verify
        Write-Host "Verifying migration..." -ForegroundColor Yellow
        Write-Host ""
        supabase db remote list
        Write-Host ""
        
        Write-Host "✅ Migration complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Test notifications API" -ForegroundColor White
        Write-Host "  2. Check browser console for errors" -ForegroundColor White
        Write-Host "  3. Verify chatbot works" -ForegroundColor White
        Write-Host "  4. Deploy to production" -ForegroundColor White
        Write-Host ""
        Write-Host "See PUSH_DATABASE_TO_SUPABASE_GUIDE.md for verification steps" -ForegroundColor Cyan
    } else {
        throw "Migration push failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error pushing migration: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try the manual method instead:" -ForegroundColor Yellow
    Write-Host "  1. Open https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. Click 'SQL Editor'" -ForegroundColor White
    Write-Host "  3. Copy FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql" -ForegroundColor White
    Write-Host "  4. Paste and click 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "See PUSH_DATABASE_TO_SUPABASE_GUIDE.md for details" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
