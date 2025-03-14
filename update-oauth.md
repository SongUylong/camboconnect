# Updating OAuth Credentials for IP Address

To make authentication work with your IP address (http://158.178.228.121:3000), you need to update your OAuth provider settings.

## Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Add the following Authorized JavaScript origins:
   - http://158.178.228.121:3000
   - http://158.178.228.121
   
6. Add the following Authorized redirect URIs:
   - http://158.178.228.121:3000/api/auth/callback/google
   - http://158.178.228.121/api/auth/callback/google

7. Save your changes

## Facebook OAuth

1. Go to the [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Navigate to "Facebook Login" > "Settings"
4. Add the following Valid OAuth Redirect URIs:
   - http://158.178.228.121:3000/api/auth/callback/facebook
   - http://158.178.228.121/api/auth/callback/facebook
   
5. Save your changes

## After Updating OAuth Settings

After updating your OAuth settings, restart your application:

```bash
docker-compose down
docker-compose up -d
```

This will ensure your application uses the updated OAuth settings. 