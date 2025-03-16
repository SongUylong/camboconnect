#!/bin/bash

# Use the development key directly
API_SECRET=fZ9q4xIDOc/2UiIVrRDVOCYUa+p3266rzZ0puM/7ZQY=

# Your API endpoint URL (adjust for your development environment)
API_URL="http://localhost:3000/api/cron/update-opportunities"

echo "Testing opportunity status update cron job..."
echo "Using API URL: $API_URL"
echo "Using API Secret: $API_SECRET"

# Make the API call
curl -X POST "$API_URL" \
  -H "authorization: $API_SECRET" \
  -H "Content-Type: application/json" \
  -v 

echo ""
echo "Done! Check the server logs for details on updated opportunities."