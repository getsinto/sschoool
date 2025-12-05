# PowerShell script to add dynamic exports to API routes

$routes = @(
    "app/api/admin/courses/assignments/route.ts",
    "app/api/admin/monitoring/course-permissions/route.ts",
    "app/api/admin/monitoring/metrics/route.ts",
    "app/api/admin/pricing-analytics/route.ts",
    "app/api/admin/subjects/requests/route.ts",
    "app/api/admin/verification/pending/route.ts"
)

$exportLines = @"
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

"@

foreach ($route in $routes) {
    if (Test-Path $route) {
        $content = Get-Content $route -Raw
        
        # Check if already has dynamic export
        if ($content -notmatch "export const dynamic") {
            # Find the first import statement
            $lines = Get-Content $route
            $insertIndex = 0
            
            for ($i = 0; $i < $lines.Count; $i++) {
                if ($lines[$i] -match "^import ") {
                    $insertIndex = $i
                    break
                }
            }
            
            # Find the last import
            for ($i = $insertIndex; $i < $lines.Count; $i++) {
                if ($lines[$i] -notmatch "^import " -and $lines[$i] -notmatch "^$") {
                    $insertIndex = $i
                    break
                }
            }
            
            # Insert the export lines
            $newLines = $lines[0..($insertIndex-1)] + "" + $exportLines.Split("`n") + $lines[$insertIndex..($lines.Count-1)]
            $newLines | Set-Content $route
            
            Write-Host "Updated: $route" -ForegroundColor Green
        } else {
            Write-Host "Skipped (already has dynamic export): $route" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Not found: $route" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
