# Profile & Custom ID Features

This document explains the new profile and custom ID system in detail.

## Overview

The chat application now includes a comprehensive profile system similar to Telegram, where users can:
- Create unique custom IDs (like @username)
- Set display names and bios
- Search for other users by their custom ID
- Complete their profile after registration

## Custom ID System

### What is a Custom ID?

A custom ID is a unique identifier that users can create for themselves, similar to Twitter/X handles or Telegram usernames. It makes it easy for others to find and connect with you.

**Examples:**
- `@john_doe`
- `@alice_2024`
- `@developer_mike`

### Custom ID Rules

1. **Length**: 3-30 characters
2. **Characters**: Only lowercase letters (a-z), numbers (0-9), and underscores (_)
3. **Uniqueness**: Must be unique across all users
4. **Permanent**: Once set, cannot be changed (in current version)

### Valid Custom IDs
✅ `john_doe`
✅ `alice123`
✅ `dev_user_2024`
✅ `test`

### Invalid Custom IDs
❌ `ab` (too short)
❌ `John_Doe` (uppercase not allowed)
❌ `john-doe` (hyphens not allowed)
❌ `john.doe` (dots not allowed)
❌ `john doe` (spaces not allowed)

## Profile Setup Flow

### 1. Registration
```
User fills form:
├── Username (display name)
├── Email (for login)
└── Password (min 6 chars)
```

### 2. Profile Setup (Automatic Redirect)
```
User creates profile:
├── Custom ID* (required, unique)
├── Display Name (optional, defaults to username)
└── Bio (optional, max 200 chars)
```

### 3. Chat Access
Once profile is complete, user can access the chat interface.

## User Model Structure

```javascript
{
  // Authentication
  email: "user@example.com",
  password: "hashed_password",
  
  // Profile
  customId: "john_doe",           // Unique @username
  username: "John",               // Original username
  displayName: "John Doe",        // Full display name
  bio: "Software developer",      // User bio
  avatar: "https://...",          // Avatar URL
  
  // Status
  profileCompleted: true,         // Has completed profile setup
  status: "online",               // online/offline/away
  lastSeen: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Check Custom ID Availability

**Endpoint**: `GET /api/profile/check-id/:customId`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "available": true,
  "message": "این شناسه در دسترس است"
}
```

**Example**:
```javascript
const response = await api.get('/profile/check-id/john_doe');
if (response.data.available) {
  console.log('ID is available!');
}
```

### Setup Profile

**Endpoint**: `POST /api/profile/setup`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**:
```json
{
  "customId": "john_doe",
  "displayName": "John Doe",
  "bio": "Software developer from NYC"
}
```

**Response**:
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "customId": "john_doe",
    "username": "John",
    "displayName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "bio": "Software developer from NYC",
    "profileCompleted": true
  }
}
```

### Get User by Custom ID

**Endpoint**: `GET /api/profile/user/:customId`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customId": "john_doe",
  "username": "John",
  "displayName": "John Doe",
  "bio": "Software developer from NYC",
  "avatar": "https://...",
  "status": "online",
  "lastSeen": "2025-05-05T20:30:00.000Z"
}
```

### Update Profile

**Endpoint**: `PUT /api/profile/update`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**:
```json
{
  "displayName": "John Smith",
  "bio": "Updated bio text",
  "avatar": "https://new-avatar-url.com/image.jpg"
}
```

**Note**: Custom ID cannot be changed after initial setup.

## Frontend Components

### ProfileSetup Component

Located at: `frontend/src/pages/ProfileSetup.jsx`

**Features**:
- Real-time custom ID validation
- Debounced availability checking (500ms)
- Character counter for bio
- Form validation
- Auto-redirect if profile already completed

**Usage**:
```jsx
import ProfileSetup from './pages/ProfileSetup';

// In router
<Route path="/profile-setup" element={<ProfileSetup />} />
```

### ChatList Component (Updated)

Located at: `frontend/src/components/ChatList.jsx`

**New Features**:
- Displays user custom IDs
- Search by custom ID, username, or display name
- Debounced search (300ms)
- Shows @customId in user list

## Search Functionality

### Search Users

**Endpoint**: `GET /api/messages/search?query=<searchTerm>`

**Headers**: 
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `query`: Search term (min 2 characters)

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "customId": "john_doe",
    "username": "John",
    "displayName": "John Doe",
    "bio": "Software developer",
    "avatar": "https://...",
    "status": "online"
  }
]
```

**Search Behavior**:
- Searches in: customId, username, displayName
- Case-insensitive
- Partial matching
- Returns max 20 results
- Excludes current user

## UI/UX Features

### Profile Setup Page

**Design Elements**:
- Clean, modern interface
- Real-time validation feedback
- Visual indicators for availability
- Character limits displayed
- Disabled submit until valid

**Validation Messages**:
- ✓ "این شناسه در دسترس است" (ID available)
- ✗ "این شناسه قبلاً استفاده شده است" (ID taken)
- "در حال بررسی..." (Checking...)

### Chat List

**Display Format**:
```
┌─────────────────────────────┐
│ [Avatar] John Doe      Now  │
│          @john_doe       ●  │
└─────────────────────────────┘
```

**Elements**:
- Avatar with colored background
- Display name (bold)
- Custom ID or bio (gray)
- Online indicator (green dot)
- Active chat indicator (blue dot)

## State Management

### Auth Store Updates

```javascript
// New method added
setUser: (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  set({ user });
}
```

**Usage**:
```javascript
const { setUser } = useAuthStore();

// After profile setup
setUser(updatedUser);
```

## Security Considerations

### Custom ID Validation

**Backend Validation**:
- Length check (3-30 chars)
- Pattern matching (regex: `^[a-z0-9_]+$`)
- Uniqueness check in database
- Case normalization (lowercase)

**Frontend Validation**:
- HTML5 pattern attribute
- Real-time checking
- Debounced API calls
- User feedback

### Profile Access Control

- Profile setup requires authentication
- Users can only update their own profile
- Custom ID uniqueness enforced at database level
- Email remains private (not returned in search)

## Migration Guide

If you have existing users without profiles:

1. **Database Migration** (optional):
```javascript
// Run this in MongoDB shell or migration script
db.users.updateMany(
  { profileCompleted: { $exists: false } },
  { 
    $set: { 
      profileCompleted: false,
      customId: null,
      displayName: "$username",
      bio: ""
    }
  }
);
```

2. **User Flow**:
- Existing users will be redirected to profile setup on next login
- They must complete profile to access chat
- Their existing messages remain intact

## Testing

### Test Cases

1. **Custom ID Validation**:
   - Try IDs with uppercase → Should convert to lowercase
   - Try IDs with special chars → Should show error
   - Try short ID (< 3 chars) → Should show error
   - Try long ID (> 30 chars) → Should show error

2. **Availability Check**:
   - Create user with ID "test_user"
   - Try to create another with same ID → Should fail
   - Search for "test" → Should find "test_user"

3. **Profile Flow**:
   - Register new user → Should redirect to profile setup
   - Complete profile → Should redirect to chat
   - Login existing user → Should go directly to chat

4. **Search**:
   - Search by custom ID → Should find user
   - Search by display name → Should find user
   - Search by partial match → Should find users
   - Search with < 2 chars → Should show no results

## Future Enhancements

- [ ] Allow custom ID changes (with cooldown period)
- [ ] Profile pictures upload
- [ ] Verified badges
- [ ] Profile visibility settings
- [ ] Custom ID history/aliases
- [ ] Profile analytics
- [ ] QR code for profile sharing
- [ ] Profile themes/customization

## Troubleshooting

### "Custom ID already taken" but user doesn't exist

**Cause**: Database inconsistency or deleted user
**Solution**: Check database directly:
```javascript
db.users.find({ customId: "problematic_id" })
```

### Profile setup keeps redirecting

**Cause**: `profileCompleted` flag not set
**Solution**: Check user object in localStorage and database

### Search not working

**Cause**: Index not created or query too short
**Solution**: 
- Ensure search query is at least 2 characters
- Check MongoDB indexes on User collection

### Real-time validation not working

**Cause**: API endpoint not responding or CORS issue
**Solution**: 
- Check backend logs
- Verify `/api/profile/check-id/:customId` endpoint
- Check browser network tab

## Best Practices

1. **Custom IDs**: Choose memorable, professional IDs
2. **Display Names**: Use real names or recognizable nicknames
3. **Bios**: Keep them concise and relevant
4. **Search**: Use @ prefix when searching by custom ID
5. **Privacy**: Don't share sensitive info in bio

---

For more information, see the main README.md file.
