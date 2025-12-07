# PowerShell script to verify Client Components are properly marked

Write-Host "🔍 Scanning for potential Server/Client Component issues..." -ForegroundColor Cyan
Write-Host ""

# Find files with useState but no 'use client'
Write-Host "📋 Checking for useState without 'use client'..." -ForegroundColor Yellow
$useStateFiles = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw
        $content -match "useState" -and $content -notmatch "'use client'" -and $content -notmatch '"use client"'
    }

if ($useStateFiles.Count -gt 0) {
    Write-Host "⚠️  Found $($useStateFiles.Count) files with useState but no 'use client':" -ForegroundColor Red
    $useStateFiles | ForEach-Object { Write-Host "   - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "✅ All files with useState have 'use client'" -ForegroundColor Green
}

Write-Host ""

# Find files with onClick but no 'use client'
Write-Host "📋 Checking for onClick without 'use client'..." -ForegroundColor Yellow
$onClickFiles = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw
        $content -match "onClick\s*=" -and $content -notmatch "'use client'" -and $content -notmatch '"use client"'
    }

if ($onClickFiles.Count -gt 0) {
    Write-Host "⚠️  Found $($onClickFiles.Count) files with onClick but no 'use client':" -ForegroundColor Red
    $onClickFiles | ForEach-Object { Write-Host "   - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "✅ All files with onClick have 'use client'" -ForegroundColor Green
}

Write-Host ""

# Find files with useEffect but no 'use client'
Write-Host "📋 Checking for useEffect without 'use client'..." -ForegroundColor Yellow
$useEffectFiles = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw
        $content -match "useEffect" -and $content -notmatch "'use client'" -and $content -notmatch '"use client"'
    }

if ($useEffectFiles.Count -gt 0) {
    Write-Host "⚠️  Found $($useEffectFiles.Count) files with useEffect but no 'use client':" -ForegroundColor Red
    $useEffectFiles | ForEach-Object { Write-Host "   - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "✅ All files with useEffect have 'use client'" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Verification complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Fix any files listed above by adding 'use client' at the top"
Write-Host "2. Run 'npm run build' to verify no build errors"
Write-Host "3. Deploy to Vercel"
