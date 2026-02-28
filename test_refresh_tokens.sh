#!/bin/bash

# Test the refresh token implementation

BASE_URL="http://localhost:5000/auth"

echo "=== Testing Refresh Token Implementation ==="
echo ""

# Test 1: Register a new user
echo "1. Testing Register endpoint..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }')
echo "Register Response: $REGISTER_RESPONSE"
echo ""

# Test 2: Login
echo "2. Testing Login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "Login Response: $LOGIN_RESPONSE"

# Extract tokens from login response (assuming JSON format)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"
echo "User ID: $USER_ID"
echo ""

# Test 3: Refresh token (with new access token)
echo "3. Testing Refresh endpoint..."
if [ -n "$REFRESH_TOKEN" ] && [ -n "$USER_ID" ]; then
  REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"refresh_token\": \"$REFRESH_TOKEN\"
    }")
  echo "Refresh Response: $REFRESH_RESPONSE"
  echo ""
  
  # Extract new access token
  NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "New Access Token: $NEW_ACCESS_TOKEN"
else
  echo "Could not extract tokens from login response"
fi
echo ""

# Test 4: Logout
echo "4. Testing Logout endpoint..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Logout Response: $LOGOUT_RESPONSE"
echo ""

echo "=== Test Complete ==="
