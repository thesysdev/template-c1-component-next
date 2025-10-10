#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying C1 model in route.ts..."

# Check if THESYS_API_KEY is set
if [ -z "$THESYS_API_KEY" ]; then
  echo -e "${RED}❌ Error: THESYS_API_KEY environment variable is not set${NC}"
  echo "Please set the THESYS_API_KEY secret in your GitHub repository settings."
  exit 1
fi

# Extract the model from route.ts
ROUTE_FILE="src/app/api/ask/route.ts"

if [ ! -f "$ROUTE_FILE" ]; then
  echo -e "${RED}❌ Error: $ROUTE_FILE not found${NC}"
  exit 1
fi

# Extract model using grep and sed
MODEL=$(grep -o 'model: "[^"]*"' "$ROUTE_FILE" | sed 's/model: "\(.*\)"/\1/')

if [ -z "$MODEL" ]; then
  echo -e "${RED}❌ Error: Could not extract model from $ROUTE_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}📝 Found model: $MODEL${NC}"

# Fetch valid models from API
echo "🌐 Fetching valid models from Thesys API..."

API_RESPONSE=$(curl -s -X 'GET' \
  'https://api.thesys.dev/v1/embed/models' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $THESYS_API_KEY")

# Check if API call was successful
if [ -z "$API_RESPONSE" ]; then
  echo -e "${RED}❌ Error: Failed to fetch models from API${NC}"
  exit 1
fi

# Extract model IDs from response
VALID_MODELS=$(echo "$API_RESPONSE" | grep -o '"id":"[^"]*"' | sed 's/"id":"\(.*\)"/\1/')

if [ -z "$VALID_MODELS" ]; then
  echo -e "${RED}❌ Error: Could not parse valid models from API response${NC}"
  exit 1
fi

# Check if the model is in the list of valid models
if echo "$VALID_MODELS" | grep -q "^${MODEL}$"; then
  echo -e "${GREEN}✅ Success: Model '$MODEL' is valid!${NC}"
  echo ""
  echo "Valid models include:"
  echo "$VALID_MODELS" | head -10
  if [ $(echo "$VALID_MODELS" | wc -l) -gt 10 ]; then
    echo "... and $(($(echo "$VALID_MODELS" | wc -l) - 10)) more"
  fi
  exit 0
else
  echo -e "${RED}❌ Error: Model '$MODEL' is not in the list of valid models${NC}"
  echo ""
  echo "Available models:"
  echo "$VALID_MODELS"
  echo ""
  echo "Please update the model in $ROUTE_FILE to one of the valid models above."
  exit 1
fi

