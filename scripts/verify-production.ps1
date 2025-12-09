# Production Verification Script
# This script verifies that all critical features are working in production

param(
    [Parameter(Mandatory=$true)]
    [string]$BaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Production Verification Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

$ErrorCount = 0
$SuccessCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✓ PASS" -ForegroundColor Green
            $script:SuccessCount++
            return $true
        } else {
            Write-Host " ✗ FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:ErrorCount++
            return $false
        }
    }
    catch {
        Write-Host " ✗ FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

function Test-Performance {
    param(
        [string]$Name,
        [string]$Url,
        [int]$MaxMilliseconds = 3000
    )
    
    Write-Host "Performance: $Name..." -NoNewline
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 30
        $stopwatch.Stop()
        
        $elapsed = $stopwatch.ElapsedMilliseconds
        
        if ($elapsed -le $MaxMilliseconds) {
            Write-Host " ✓ PASS ($elapsed ms)" -ForegroundColor Green
            $script:SuccessCount++
            return $true
        } else {
            Write-Host " ✗ FAIL ($elapsed ms > $MaxMilliseconds ms)" -ForegroundColor Yellow
            $script:ErrorCount++
            return $false
        }
    }
    catch {
        Write-Host " ✗ FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

# 1. Basic Connectivity
Write-Host "`n1. Basic Connectivity Tests" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan
Test-Endpoint -Name "Homepage" -Url "$BaseUrl"
Test-Endpoint -Name "Health Check" -Url "$BaseUrl/api/health"

# 2. Performance Tests
Write-Host "`n2. Performance Tests" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Cyan
Test-Performance -Name "Homepage Load Time" -Url "$BaseUrl" -MaxMilliseconds 3000
Test-Performance -Name "API Response Time" -Url "$BaseUrl/api/health" -MaxMilliseconds 500

# 3. Authentication Endpoints
Write-Host "`n3. Authentication Endpoints" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan
Test-Endpoint -Name "Login Page" -Url "$BaseUrl/login"
Test-Endpoint -Name "Register Page" -Url "$BaseUrl/register"

# 4. Google Meet OAuth Endpoints
Write-Host "`n4. Google Meet OAuth Endpoints" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan
Test-Endpoint -Name "Google Meet Auth Endpoint" -Url "$BaseUrl/api/google-meet/auth" -ExpectedStatus 401
Test-Endpoint -Name "Google Meet Callback Endpoint" -Url "$BaseUrl/api/google-meet/callback" -ExpectedStatus 400

# 5. File Upload Endpoints
Write-Host "`n5. File Upload Endpoints" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
Test-Endpoint -Name "File Upload Endpoint" -Url "$BaseUrl/api/upload/file" -Method "POST" -ExpectedStatus 401

# 6. Session Management
Write-Host "`n6. Session Management Endpoints" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan
Test-Endpoint -Name "Session Refresh Endpoint" -Url "$BaseUrl/api/session/refresh" -Method "POST" -ExpectedStatus 401
Test-Endpoint -Name "Session Verify Endpoint" -Url "$BaseUrl/api/session/verify" -Method "POST" -ExpectedStatus 401

# 7. Teacher API Endpoints
Write-Host "`n7. Teacher API Endpoints" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
Test-Endpoint -Name "Teacher Students Endpoint" -Url "$BaseUrl/api/teacher/students" -ExpectedStatus 401
Test-Endpoint -Name "Teacher Messages Endpoint" -Url "$BaseUrl/api/teacher/messages" -ExpectedStatus 401
Test-Endpoint -Name "Teacher Grading Stats" -Url "$BaseUrl/api/teacher/grading/statistics" -ExpectedStatus 401

# 8. Public Pages
Write-Host "`n8. Public Pages" -ForegroundColor Cyan
Write-Host "---------------" -ForegroundColor Cyan
Test-Endpoint -Name "About Page" -Url "$BaseUrl/about"
Test-Endpoint -Name "Contact Page" -Url "$BaseUrl/contact"
Test-Endpoint -Name "FAQ Page" -Url "$BaseUrl/faq"
Test-Endpoint -Name "Privacy Policy" -Url "$BaseUrl/privacy-policy"

# 9. Security Headers
Write-Host "`n9. Security Headers Check" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method GET -UseBasicParsing
    $headers = $response.Headers
    
    $securityHeaders = @(
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection"
    )
    
    foreach ($header in $securityHeaders) {
        if ($headers.ContainsKey($header)) {
            Write-Host "  $header : ✓ Present" -ForegroundColor Green
            $script:SuccessCount++
        } else {
            Write-Host "  $header : ✗ Missing" -ForegroundColor Yellow
            $script:ErrorCount++
        }
    }
}
catch {
    Write-Host "  Failed to check security headers" -ForegroundColor Red
    $script:ErrorCount++
}

# 10. SSL/TLS Check
Write-Host "`n10. SSL/TLS Verification" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan

if ($BaseUrl -like "https://*") {
    Write-Host "  HTTPS Enabled: ✓ PASS" -ForegroundColor Green
    $script:SuccessCount++
} else {
    Write-Host "  HTTPS Enabled: ✗ FAIL (Using HTTP)" -ForegroundColor Red
    $script:ErrorCount++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($SuccessCount + $ErrorCount)" -ForegroundColor White
Write-Host "Passed: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $ErrorCount" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($SuccessCount / ($SuccessCount + $ErrorCount)) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "✓ All tests passed! Production is healthy." -ForegroundColor Green
    exit 0
} elseif ($ErrorCount -le 3) {
    Write-Host "⚠ Some tests failed. Review the results above." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✗ Multiple tests failed. Production may have issues." -ForegroundColor Red
    exit 1
}
