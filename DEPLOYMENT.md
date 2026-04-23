# Deployment Guide - Quality Data Core with Authentication

## Current Setup
- **Backend**: Railway (quality-data-app-production.up.railway.app)
- **Frontend**: GitHub Pages
- **Authentication**: Password-based with session management
- **Password**: grace1588@

## Deployment Steps

### 1. Backend Deployment (Railway)

#### Environment Variables to Set in Railway:
```
NODE_ENV=production
SESSION_SECRET=your-random-secret-key-here-change-this
ADMIN_PASSWORD=grace1588@
```

#### Steps:
1. Go to your Railway dashboard
2. Select your `quality-data-app-production` service
3. Go to "Variables" tab
4. Add the environment variables above
5. Redeploy the service

### 2. Frontend Deployment (GitHub Pages)

#### Files to Deploy:
- `docs/index.html` - Main application with authentication

#### Steps:
1. Commit all changes to Git:
   ```bash
   git add .
   git commit -m "Add authentication system with password grace1588@"
   git push origin main
   ```

2. GitHub Pages will automatically deploy from the `docs/` folder

### 3. Verification

After deployment:
1. Visit your GitHub Pages URL
2. Should see login screen
3. Enter password: `grace1588@`
4. Should access the quality data system

## Important Notes

### Security:
- The password `grace1588@` is now set as default
- Change `SESSION_SECRET` to a random string in production
- Consider using environment variables instead of hardcoded passwords

### Session Management:
- Sessions expire after 24 hours
- Users must log out manually to end session early
- Session data is stored server-side

### CORS Configuration:
- Backend accepts requests from any origin with credentials
- Frontend includes credentials in all API requests

## Troubleshooting

### Login Issues:
- Check Railway environment variables are set correctly
- Verify the server is using `server-with-auth.js`
- Check browser console for CORS errors

### Data Not Saving:
- Ensure authentication is working
- Check if session is still valid
- Verify Railway service is running

### Session Issues:
- Clear browser cookies if login state persists incorrectly
- Check session timeout (24 hours)
- Verify `SESSION_SECRET` is set in production

## Files Changed

1. `package.json` - Updated start script to use `server-with-auth.js`
2. `server-with-auth.js` - Complete server with authentication
3. `docs/index.html` - Frontend with authentication system
4. `server.js` - Local development server (unchanged)

## Next Steps

1. Deploy to Railway with environment variables
2. Push changes to GitHub for frontend deployment
3. Test the live authentication system
4. Consider adding more security features (rate limiting, password complexity, etc.)
