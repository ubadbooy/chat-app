# Chat Application with Custom User IDs

A modern, Telegram-like chat application with user profiles, custom IDs, and real-time messaging.

## Features

### User Authentication & Profiles
- **User Registration & Login** - Secure authentication with JWT tokens
- **Custom User IDs** - Create unique @username-style IDs (like Telegram)
- **Profile Setup** - Set display name, bio, and custom ID after registration
- **Profile Validation** - Real-time availability checking for custom IDs

### Chat Interface
- **Telegram-like UI** - Clean, modern interface inspired by Telegram
- **User List** - Browse all users on the right sidebar
- **Real-time Search** - Search users by custom ID, username, or display name
- **Live Messaging** - Real-time chat with Socket.IO
- **Message History** - Persistent message storage with MongoDB

### Technical Features
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Real-time**: WebSocket connections for instant messaging
- **Responsive**: Works on desktop and mobile devices

## Project Structure

```
chat-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User model with custom IDs
│   │   └── Message.js            # Message model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── messages.js           # Message & user routes
│   │   └── profile.js            # Profile management routes
│   ├── socket/
│   │   └── socketHandler.js      # Socket.IO event handlers
│   └── server.js                 # Express server setup
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatList.jsx      # User list sidebar
    │   │   ├── ChatWindow.jsx    # Chat messages display
    │   │   └── Login.jsx         # Login component (legacy)
    │   ├── pages/
    │   │   ├── Register.jsx      # Registration page
    │   │   ├── Login.jsx         # Login page
    │   │   ├── ProfileSetup.jsx  # Profile creation page
    │   │   └── Chat.jsx          # Main chat page
    │   ├── services/
    │   │   ├── api.js            # API client
    │   │   └── socket.js         # Socket.IO client
    │   ├── store/
    │   │   ├── useAuthStore.js   # Authentication state
    │   │   └── useChatStore.js   # Chat state
    │   └── App.jsx               # Main app component
    └── ...

```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key-here
```

4. Start the server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## User Flow

### 1. Registration
- User signs up with username, email, and password
- After registration, redirected to profile setup

### 2. Profile Setup
- Create a unique custom ID (e.g., @john_doe)
- Set display name and bio
- Real-time validation ensures ID is available
- Custom ID rules:
  - 3-30 characters
  - Only lowercase letters, numbers, and underscores
  - Must be unique

### 3. Chat Interface
- **Left Side**: Chat window with messages
- **Right Side**: User list with search
- Click any user to start chatting
- Search by custom ID, username, or display name

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Profile
- `GET /api/profile/check-id/:customId` - Check if custom ID is available
- `POST /api/profile/setup` - Create/update user profile
- `GET /api/profile/user/:customId` - Get user by custom ID
- `PUT /api/profile/update` - Update profile info

### Messages
- `GET /api/messages/users` - Get all users
- `GET /api/messages/search?query=` - Search users
- `GET /api/messages/conversation/:userId` - Get messages with user
- `POST /api/messages/send` - Send message
- `GET /api/messages/unread` - Get unread message count

### Socket Events
- `send-message` - Send a message
- `receive-message` - Receive a message
- `message-sent` - Confirmation of sent message
- `user-online` - User came online
- `user-offline` - User went offline

## Database Schema

### User Model
```javascript
{
  customId: String,          // Unique custom ID (@username)
  username: String,          // Display username
  displayName: String,       // Full display name
  bio: String,              // User bio (max 200 chars)
  email: String,            // Email (unique)
  password: String,         // Hashed password
  avatar: String,           // Avatar URL
  profileCompleted: Boolean, // Profile setup status
  status: String,           // online/offline/away
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  sender: ObjectId,         // Reference to User
  receiver: ObjectId,       // Reference to User
  content: String,          // Message text
  type: String,            // text/image/file
  read: Boolean,           // Read status
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket client
- **Tailwind CSS** - Styling

## Features in Detail

### Custom User IDs
- Similar to Telegram's @username system
- Real-time availability checking
- Searchable and shareable
- Unique across the platform

### User Search
- Search by custom ID (@john_doe)
- Search by display name
- Search by username
- Debounced search (300ms delay)
- Shows results as you type

### Profile Management
- One-time profile setup after registration
- Can update display name and bio later
- Custom ID is permanent once set
- Avatar generation based on username

### Real-time Messaging
- Instant message delivery
- Online/offline status
- Message read receipts
- Typing indicators (can be added)

## Future Enhancements

- [ ] Group chats
- [ ] File and image sharing
- [ ] Voice messages
- [ ] Video calls
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] User blocking
- [ ] Push notifications
- [ ] Dark mode
- [ ] Message encryption

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
