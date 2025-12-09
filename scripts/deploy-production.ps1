# Production Deployment Script
# This script automates the production deployment process

param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Production Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get version from package.json if not provided
if ([string]::IsNullOrEmpty($Version)) {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $Version = $packageJson.version
    Write-Host "Using version from package.json: $Version" -ForegroundColor Yellow
} else {
    Write-Host "Using provided version: $Version" -ForegroundColor Yellow
}

Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No actual deployment will occur" -ForegroundColor Yellow
    Write-Host ""
}

# Function to run command with error handling
function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Command,
        [bool]$Required = $true
    )
    
    Write-Host "[$Name]" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "  Would execute: $Command" -ForegroundColor Gray
        return $true
    }
    
    try {
        & $Command
        Write-Host "  ✓ Complete" -ForegroundColor Green
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        
        if ($Required) {
            Write-Host "Deployment aborted due to error." -ForegroundColor Red
            exit 1
        }
        
        return $false
    }
}

# Step 1: Pre-deployment checks
Write-Host "Step 1: Pre-Deployment Checks" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta
Write-Host ""

Invoke-Step -Name "Check Git Status" -Command {
    $status = git status --porcelain
    if ($status) {
        throw "Working directory is not clean. Commit or stash changes first."
    }
}

Invoke-Step -Name "Check Current Branch" -Command {
    $branch = git branch --show-current
    if ($branch -ne "main" -and $branch -ne "master") {
        throw "Not on main/master branch. Current branch: $branch"
    }
}

Invoke-Step -Name "Pull Latest Changes" -Command {
    git pull origin main
}

# Step 2: Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Host "Step 2: Run Tests" -ForegroundColor Magenta
    Write-Host "=================" -ForegroundColor Magenta
    Write-Host ""
    
    Invoke-Step -Name "Type Check" -Command {
        npm run type-check
    }
    
    Invoke-Step -Name "Lint Check" -Command {
        npm run lint
    }
    
    Invoke-Step -Name "Run Tests" -Command {
        npm test
    }
    
    Invoke-Step -Name "Build Check" -Command {
        npm run build
    }
} else {
    Write-Host "Step 2: Tests Skipped" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Update version
Write-Host "Step 3: Version Management" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta
Write-Host ""

Invoke-Step -Name "Create Git Tag" -Command {
    git tag -a "v$Version" -m "Release version $Version"
    git push origin "v$Version"
}

# Step 4: Create Sentry release
Write-Host "Step 4: Sentry Release" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta
Write-Host ""

Invoke-Step -Name "Create Sentry Release" -Command {
    if (Get-Command sentry-cli -ErrorAction SilentlyContinue) {
        sentry-cli releases new $Version
        sentry-cli releases set-commits $Version --auto
        sentry-cli releases finalize $Version
    } else {
        Write-Host "  Sentry CLI not found. Skipping..." -ForegroundColor Yellow
    }
} -Required $false

# Step 5: Deploy to Vercel
Write-Host "Step 5: Deploy to Vercel" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta
Write-Host ""

Invoke-Step -Name "Deploy to Production" -Command {
    if ($DryRun) {
        Write-Host "  Would run: vercel --prod" -ForegroundColor Gray
    } else {
        vercel --prod
    }
}

# Step 6: Mark Sentry deployment
Write-Host "Step 6: Mark Sentry Deployment" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta
Write-Host ""

Invoke-Step -Name "Mark Deployment in Sentry" -Command {
    if (Get-Command sentry-cli -ErrorAction SilentlyContinue) {
        sentry-cli releases deploys $Version new -e production
    } else {
        Write-Host "  Sentry CLI not found. Skipping..." -ForegroundColor Yellow
    }
} -Required $false

# Step 7: Verify deployment
Write-Host "Step 7: Verify Deployment" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host ""

if (-not $DryRun) {
    Write-Host "Waiting 30 seconds for deployment to propagate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host ""
    Write-Host "Running verification script..." -ForegroundColor Yellow
    
    # Get production URL from Vercel
    $productionUrl = vercel ls --prod | Select-String -Pattern "https://" | Select-Object -First 1
    
    if ($productionUrl) {
        $url = $productionUrl.ToString().Trim()
        Write-Host "Production URL: $url" -ForegroundColor Cyan
        Write-Host ""
        
        # Run verification script
        if (Test-Path "scripts/verify-production.ps1") {
            & "scripts/verify-production.ps1" -BaseUrl $url
        } else {
            Write-Host "Verification script not found. Skipping..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not determine production URL. Manual verification required." -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Version: $Version" -ForegroundColor White
Write-Host "Status: " -NoNewline
if ($DryRun) {
    Write-Host "DRY RUN COMPLETE" -ForegroundColor Yellow
} else {
    Write-Host "DEPLOYED" -ForegroundColor Green
}
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

if (-not $DryRun) {
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Monitor Sentry for errors" -ForegroundColor White
    Write-Host "2. Check Vercel logs" -ForegroundColor White
    Write-Host "3. Verify critical features" -ForegroundColor White
    Write-Host "4. Notify team of deployment" -ForegroundColor White
    Write-Host ""
    Write-Host "✓ Deployment complete!" -ForegroundColor Green
} else {
    Write-Host "This was a dry run. No actual deployment occurred." -ForegroundColor Yellow
    Write-Host "Run without -DryRun flag to deploy for real." -ForegroundColor Yellow
}

Write-Host ""
