# Script to fix missing await on createClient() calls in API routes

$files = @(
    "app/api/zoom/update-meeting/[id]/route.ts",
    "app/api/zoom/recordings/[meetingId]/route.ts",
    "app/api/zoom/participants/[meetingId]/route.ts",
    "app/api/zoom/recording/stop/[meetingId]/route.ts",
    "app/api/zoom/recording/start/[meetingId]/route.ts",
    "app/api/zoom/generate-signature/route.ts",
    "app/api/zoom/meeting/[id]/route.ts",
    "app/api/zoom/create-meeting/route.ts",
    "app/api/zoom/delete-meeting/[id]/route.ts",
    "app/api/zoom/attendance/[meetingId]/route.ts",
    "app/api/webhooks/zoom/route.ts",
    "app/api/webhooks/stripe/route.ts",
    "app/api/test-supabase/route.ts",
    "app/api/user/profile/route.ts",
    "app/api/teacher/subjects/route.ts",
    "app/api/teacher/subjects/custom/route.ts",
    "app/api/support/tickets/[id]/survey/route.ts",
    "app/api/support/tickets/[id]/route.ts",
    "app/api/support/tickets/[id]/attachments/route.ts",
    "app/api/support/tickets/[id]/close/route.ts",
    "app/api/support/tickets/[id]/reply/route.ts",
    "app/api/support/tickets/route.ts",
    "app/api/teacher/live-classes/[id]/route.ts",
    "app/api/teacher/live-classes/[id]/start/route.ts",
    "app/api/teacher/live-classes/route.ts",
    "app/api/teacher/courses/create/route.ts",
    "app/api/teacher/courses/[id]/batches/[batchId]/route.ts",
    "app/api/teacher/courses/[id]/batches/route.ts"
)

$fixedCount = 0
$errorCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw
            
            # Replace "const supabase = createClient()" with "const supabase = await createClient()"
            # But only if it doesn't already have await
            $newContent = $content -replace '(\s+)const supabase = createClient\(\)', '$1const supabase = await createClient()'
            
            # Also handle cases with cookieStore
            $newContent = $newContent -replace '(\s+)const cookieStore = cookies\(\)\s+const supabase = createClient\(\)', '$1const supabase = await createClient()'
            
            if ($content -ne $newContent) {
                Set-Content $file -Value $newContent -NoNewline
                Write-Host "✓ Fixed: $file" -ForegroundColor Green
                $fixedCount++
            } else {
                Write-Host "- Skipped (already correct): $file" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "✗ Error processing $file : $_" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "  Errors: $errorCount files" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
