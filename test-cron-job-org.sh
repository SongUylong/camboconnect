#!/bin/bash

# API Secret key
API_SECRET="fZ9q4xIDOc/2UiIVrRDVOCYUa+p3266rzZ0puM/7ZQY="

# Ask for the public URL
echo "Enter your public API URL (e.g., https://yourdomain.com/api/cron/update-opportunities):"
read -r API_URL

if [ -z "$API_URL" ]; then
  echo "No URL provided. Using localhost for testing."
  API_URL="http://localhost:3000/api/cron/update-opportunities"
fi

echo "Testing opportunity status update with cron-job.org simulation..."
echo "Using API URL: $API_URL"
echo "Using API Secret: $API_SECRET"

# Make the API call (similar to how cron-job.org would call it)
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $API_SECRET" \
  -H "Content-Type: application/json" \
  -H "User-Agent: cron-job.org/1.0" \
  -v 

echo ""
echo "Done! If this test was successful, cron-job.org should work correctly."
echo ""
echo "To set up on cron-job.org:"
echo "1. Create a new cron job"
echo "2. Set URL to: $API_URL"
echo "3. Set Method to: POST"
echo "4. Add Headers:"
echo "   - Authorization: Bearer $API_SECRET"
echo "   - Content-Type: application/json"
echo "5. Set schedule to run hourly (or your preferred frequency)" 