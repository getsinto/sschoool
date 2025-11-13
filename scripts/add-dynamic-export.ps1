# PowerShell script to add dynamic export to all API routes

$apiRoutesPath = "app/api"
$routeFiles = Get-ChildItem -Path $apiRoutesPath -Filter "route.ts" -Recurse

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file already has dynamic export
    if ($content -notmatch "export const dynamic") {
        Write-Host "Adding dynamic export to: $($file.FullName)"
        
        # Find the first import or export statement
        if ($content -match "^(import .+\n)+") {
            # Add after imports
            $content = $content -replace "(^(?:import .+\n)+)", "`$1`nexport const dynamic = 'force-dynamic'`n"
        } else {
            # Add at the beginning
            $content = "export const dynamic = 'force-dynamic'`n`n" + $content
        }
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
    } else {
        Write-Host "Skipping (already has dynamic): $($file.FullName)"
    }
}

Write-Host "`nDone! Processed $($routeFiles.Count) route files."
