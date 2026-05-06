# API Examples & Testing

This document provides example API requests for testing all endpoints.

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register New User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "customId": null,
    "username": "John",
    "displayName": null,
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?background=random&name=John",
    "bio": "",
    "profileCompleted": false
  }
}
```

### 2. Login User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "customId": "john_doe",
    "username": "John",
    "displayName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?background=random&name=John",
    "bio": "Software developer",
    "profileCompleted": true
  }
}
```

### 3. Get Current User

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customId": "john_doe",
  "username": "John",
  "displayName": "John Doe",
  "email": "john@example.com",
  "avatar": "https://ui-avatars.com/api/?background=random&name=John",
  "bio": "Software developer",
  "profileCompleted": true,
  "status": "online",
  "lastSeen": "2025-05-05T20:30:00.000Z",
  "createdAt": "2025-05-05T10:00:00.000Z",
  "updatedAt": "2025-05-05T20:30:00.000Z"
}
```

## Profile Endpoints

### 4. Check Custom ID Availability

**Request:**
```bash
curl -X GET http://localhost:5000/api/profile/check-id/john_doe \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (Available):**
```json
{
  "available": true,
  "message": "این شناسه در دسترس است"
}
```

**Response (Taken):**
```json
{
  "available": false,
  "message": "این شناسه قبلاً استفاده شده است"
}
```

### 5. Setup Profile

**Request:**
```bash
curl -X POST http://localhost:5000/api/profile/setup \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "customId": "john_doe",
    "displayName": "John Doe",
    "bio": "Software developer from NYC"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "customId": "john_doe",
    "username": "John",
    "displayName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?background=random&name=John",
    "bio": "Software developer from NYC",
    "profileCompleted": true
  }
}
```

### 6. Get User by Custom ID

**Request:**
```bash
curl -X GET http://localhost:5000/api/profile/user/john_doe \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customId": "john_doe",
  "username": "John",
  "displayName": "John Doe",
  "bio": "Software developer from NYC",
  "avatar": "https://ui-avatars.com/api/?background=random&name=John",
  "status": "online",
  "lastSeen": "2025-05-05T20:30:00.000Z",
  "createdAt": "2025-05-05T10:00:00.000Z",
  "updatedAt": "2025-05-05T20:30:00.000Z"
}
```

### 7. Update Profile

**Request:**
```bash
curl -X PUT http://localhost:5000/api/profile/update \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Smith",
    "bio": "Updated bio text"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "customId": "john_doe",
    "username": "John",
    "displayName": "John Smith",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?background=random&name=John",
    "bio": "Updated bio text",
    "profileCompleted": true
  }
}
```

## Message Endpoints

### 8. Get All Users

**Request:**
```bash
curl -X GET http://localhost:5000/api/messages/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "customId": "alice_smith",
    "username": "Alice",
    "displayName": "Alice Smith",
    "email": "alice@example.com",
    "avatar": "https://ui-avatars.com/api/?background=random&name=Alice",
    "bio": "Designer",
    "status": "online",
    "lastSeen": "2025-05-05T20:35:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "customId": "bob_jones",
    "username": "Bob",
    "displayName": "Bob Jones",
    "email": "bob@example.com",
    "avatar": "https://ui-avatars.com/api/?background=random&name=Bob",
    "bio": "Product Manager",
    "status": "offline",
    "lastSeen": "2025-05-05T18:00:00.000Z"
  }
]
```

### 9. Search Users

**Request:**
```bash
curl -X GET "http://localhost:5000/api/messages/search?query=alice" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "customId": "alice_smith",
    "username": "Alice",
    "displayName": "Alice Smith",
    "bio": "Designer",
    "avatar": "https://ui-avatars.com/api/?background=random&name=Alice",
    "status": "online"
  }
]
```

### 10. Get Conversation Messages

**Request:**
```bash
curl -X GET http://localhost:5000/api/messages/conversation/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "John",
      "avatar": "https://..."
    },
    "receiver": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "Alice",
      "avatar": "https://..."
    },
    "content": "Hello Alice!",
    "type": "text",
    "read": true,
    "readAt": "2025-05-05T20:31:00.000Z",
    "createdAt": "2025-05-05T20:30:00.000Z",
    "updatedAt": "2025-05-05T20:31:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "Alice",
      "avatar": "https://..."
    },
    "receiver": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "John",
      "avatar": "https://..."
    },
    "content": "Hi John! How are you?",
    "type": "text",
    "read": false,
    "createdAt": "2025-05-05T20:32:00.000Z",
    "updatedAt": "2025-05-05T20:32:00.000Z"
  }
]
```

### 11. Send Message

**Request:**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "507f1f77bcf86cd799439012",
    "content": "Hello Alice!",
    "type": "text"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "sender": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "John",
    "avatar": "https://..."
  },
  "receiver": {
    "_id": "507f1f77bcf86cd799439012",
    "username": "Alice",
    "avatar": "https://..."
  },
  "content": "Hello Alice!",
  "type": "text",
  "read": false,
  "createdAt": "2025-05-05T20:30:00.000Z",
  "updatedAt": "2025-05-05T20:30:00.000Z"
}
```

### 12. Get Unread Message Count

**Request:**
```bash
curl -X GET http://localhost:5000/api/messages/unread \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "count": 5
}
```

## Socket.IO Events

### Connect to Socket

**JavaScript Example:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to socket server');
});
```

### Send Message

**Emit:**
```javascript
socket.emit('send-message', {
  receiverId: '507f1f77bcf86cd799439012',
  content: 'Hello!',
  type: 'text'
});
```

### Receive Message

**Listen:**
```javascript
socket.on('receive-message', (message) => {
  console.log('New message:', message);
  // message structure same as HTTP response
});
```

### Message Sent Confirmation

**Listen:**
```javascript
socket.on('message-sent', (message) => {
  console.log('Message sent successfully:', message);
});
```

## Testing with Postman

### Setup Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:5000/api`
- `token`: (will be set after login)

### Collection Structure

```
Chat App API
├── Auth
│   ├── Register
│   ├── Login
│   └── Get Me
├── Profile
│   ├── Check ID Availability
│   ├── Setup Profile
│   ├── Get User by Custom ID
│   └── Update Profile
└── Messages
    ├── Get All Users
    ├── Search Users
    ├── Get Conversation
    ├── Send Message
    └── Get Unread Count
```

### Auto-set Token Script

Add this to the "Tests" tab of Login request:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "شناسه باید بین ۳ تا ۳۰ کاراکتر باشد"
}
```

### 401 Unauthorized
```json
{
  "message": "توکن نامعتبر است"
}
```

### 404 Not Found
```json
{
  "message": "کاربر یافت نشد"
}
```

### 500 Internal Server Error
```json
{
  "message": "خطای سرور"
}
```

## Testing Checklist

### Authentication Flow
- [ ] Register with valid data
- [ ] Register with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with valid token

### Profile Flow
- [ ] Check available custom ID
- [ ] Check taken custom ID
- [ ] Setup profile with valid data
- [ ] Setup profile with invalid custom ID (should fail)
- [ ] Setup profile with taken custom ID (should fail)
- [ ] Get user by custom ID
- [ ] Update profile

### Messaging Flow
- [ ] Get all users
- [ ] Search users by custom ID
- [ ] Search users by display name
- [ ] Get conversation with user
- [ ] Send message to user
- [ ] Get unread count
- [ ] Mark messages as read (automatic on conversation fetch)

### Socket.IO Flow
- [ ] Connect to socket with valid token
- [ ] Connect to socket without token (should fail)
- [ ] Send message via socket
- [ ] Receive message via socket
- [ ] Get message sent confirmation

## Performance Testing

### Load Test Example (using Apache Bench)

```bash
# Test user search endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/messages/search?query=test

# Test get users endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/messages/users
```

### Expected Response Times
- Authentication: < 200ms
- Profile operations: < 150ms
- User search: < 100ms
- Get messages: < 200ms
- Send message: < 150ms

---

For more information, see README.md and PROFILE_FEATURES.md
