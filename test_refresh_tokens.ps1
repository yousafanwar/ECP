# Test Refresh Token Implementation

$BASE_URL = "http://localhost:5000/auth"

Write-Host "=== Testing Refresh Token Implementation ===" -ForegroundColor Green
Write-Host ""

# Test 1: Register a new user
Write-Host "1. Testing Register endpoint..." -ForegroundColor Yellow
$RegisterBody = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $RegisterResponse = Invoke-RestMethod -Uri "$BASE_URL/register" -Method Post -Body $RegisterBody -ContentType "application/json"
    Write-Host "Register Response: $(ConvertTo-Json $RegisterResponse)" -ForegroundColor Cyan
} catch {
    Write-Host "Register Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Login
Write-Host "2. Testing Login endpoint..." -ForegroundColor Yellow
$LoginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $LoginResponse = Invoke-RestMethod -Uri "$BASE_URL/login" -Method Post -Body $LoginBody -ContentType "application/json"
    Write-Host "Login Response: $(ConvertTo-Json $LoginResponse)" -ForegroundColor Cyan
    
    $AccessToken = $LoginResponse.access_token
    $RefreshToken = $LoginResponse.refresh_token
    $UserId = $LoginResponse.userId
    
    Write-Host "Access Token: $AccessToken" -ForegroundColor Cyan
    Write-Host "Refresh Token: $RefreshToken" -ForegroundColor Cyan
    Write-Host "User ID: $UserId" -ForegroundColor Cyan
} catch {
    Write-Host "Login Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Refresh Token
Write-Host "3. Testing Refresh endpoint..." -ForegroundColor Yellow
if ($null -ne $RefreshToken -and $null -ne $UserId) {
    $RefreshBody = @{
        userId = $UserId
        refresh_token = $RefreshToken
    } | ConvertTo-Json
    
    try {
        $RefreshResponse = Invoke-RestMethod -Uri "$BASE_URL/refresh" -Method Post -Body $RefreshBody -ContentType "application/json"
        Write-Host "Refresh Response: $(ConvertTo-Json $RefreshResponse)" -ForegroundColor Cyan
        
        $NewAccessToken = $RefreshResponse.access_token
        Write-Host "New Access Token: $NewAccessToken" -ForegroundColor Cyan
    } catch {
        Write-Host "Refresh Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Could not extract tokens from login response" -ForegroundColor Red
}
Write-Host ""

# Test 4: Logout
Write-Host "4. Testing Logout endpoint..." -ForegroundColor Yellow
if ($null -ne $AccessToken) {
    $Headers = @{
        "Authorization" = "Bearer $AccessToken"
    }
    
    try {
        $LogoutResponse = Invoke-RestMethod -Uri "$BASE_URL/logout" -Method Post -Headers $Headers -ContentType "application/json"
        Write-Host "Logout Response: $(ConvertTo-Json $LogoutResponse)" -ForegroundColor Cyan
    } catch {
        Write-Host "Logout Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "No access token available for logout test" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Green
