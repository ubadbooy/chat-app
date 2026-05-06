# Quick Start Guide

Get your chat application running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need v16+)
node --version

# Check npm
npm --version

# Check MongoDB (should be running)
mongosh --version
# OR if using MongoDB Atlas, have your connection string ready
```

## Step 1: Clone and Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'ENVFILE'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
ENVFILE

# Start backend server
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected
```

## Step 2: Setup Frontend (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 3: Test the Application

1. Open browser to `http://localhost:5173`
2. Click "Create an account"
3. Fill in registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Create account"
5. You'll be redirected to Profile Setup
6. Create your custom ID:
   - Custom ID: `test_user` (or any unique ID)
   - Display Name: `Test User`
   - Bio: `This is my test account`
7. Click "Complete Setup"
8. You're now in the chat interface!

## Step 4: Test Chat (Open Second Browser/Incognito)

1. Open another browser window (or incognito mode)
2. Go to `http://localhost:5173`
3. Register another user:
   - Username: `seconduser`
   - Email: `second@example.com`
   - Password: `password123`
4. Setup profile with custom ID: `second_user`
5. Search for `@test_user` in the search bar
6. Click on the user to start chatting
7. Send a message!
8. Switch back to first browser - you should see the message in real-time!

## Common Issues

### Backend won't start

**Issue**: `MongoDB connection error`
**Solution**: 
- Make sure MongoDB is running: `sudo systemctl start mongod` (Linux) or start MongoDB service
- Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

**Issue**: `JWT_SECRET is not configured`
**Solution**: Make sure `.env` file exists in backend folder with `JWT_SECRET` set

### Frontend won't start

**Issue**: `Port 5173 is already in use`
**Solution**: Kill the process using port 5173 or change port in `vite.config.js`

**Issue**: `Cannot connect to backend`
**Solution**: 
- Make sure backend is running on port 5000
- Check CORS settings in `backend/server.js`

### Can't register user

**Issue**: `User already exists`
**Solution**: Use a different email address

**Issue**: `Custom ID already taken`
**Solution**: Choose a different custom ID

### Messages not appearing

**Issue**: Real-time messages not working
**Solution**: 
- Check browser console for Socket.IO errors
- Make sure both backend and frontend are running
- Try refreshing the page

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and loads
- [ ] Can register new user
- [ ] Redirected to profile setup after registration
- [ ] Can create custom ID with validation
- [ ] Can login with existing user
- [ ] User list shows on right sidebar
- [ ] Can search users by custom ID
- [ ] Can click user to open chat
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Can logout and login again

## Next Steps

- Customize the UI colors in Tailwind config
- Add more features (see README.md)
- Deploy to production (Heroku, Vercel, etc.)
- Set up proper MongoDB Atlas cluster
- Configure environment variables for production

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints section
- Check browser console for errors
- Check backend terminal for server errors

Happy chatting! 🚀
