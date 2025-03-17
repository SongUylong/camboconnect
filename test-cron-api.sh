#!/bin/bash

# Use the development key directly
API_SECRET=fZ9q4xIDOc/2UiIVrRDVOCYUa+p3266rzZ0puM/7ZQY=

# Test opportunity status update cron job
echo "Testing opportunity status update cron job..."
API_URL="http://localhost:3000/api/cron/update-opportunities"
echo "Using API URL: $API_URL"
echo "Using API Secret: $API_SECRET"

# Make the API call
curl -X POST "$API_URL" \
  -H "Authorization: $API_SECRET" \
  -H "Content-Type: application/json" \
  -v 

echo ""
echo "Done! Check the server logs for details on updated opportunities."

# Test deadline reminders cron job
echo ""
echo "Testing deadline reminder notifications cron job..."
DEADLINE_API_URL="http://localhost:3000/api/cron/check-deadlines"
echo "Using API URL: $DEADLINE_API_URL"
echo "Using API Secret: $API_SECRET"

# Make the API call
curl -X POST "$DEADLINE_API_URL" \
  -H "Authorization: $API_SECRET" \
  -H "Content-Type: application/json" \
  -v 

echo ""
echo "Done! Check the server logs for details on deadline reminder notifications."