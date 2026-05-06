# User Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEW USER FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE (/)
   │
   ├─→ Not Logged In → Redirect to /register
   │
   └─→ Logged In → Check profile status
       │
       ├─→ Profile Incomplete → /profile-setup
       │
       └─→ Profile Complete → /chat


2. REGISTRATION (/register)
   │
   ┌──────────────────────────┐
   │  Registration Form       │
   │  ├─ Username            │
   │  ├─ Email               │
   │  └─ Password            │
   └──────────────────────────┘
   │
   │ [Submit]
   │
   ├─→ Success → Save token & user data
   │             │
   │             └─→ Redirect to /profile-setup
   │
   └─→ Error → Show error message


3. PROFILE SETUP (/profile-setup)
   │
   ┌──────────────────────────────────┐
   │  Profile Setup Form              │
   │  ├─ Custom ID (@username) *      │
   │  │  └─ Real-time validation      │
   │  ├─ Display Name                 │
   │  └─ Bio (max 200 chars)          │
   └──────────────────────────────────┘
   │
   │ [Complete Setup]
   │
   ├─→ Success → Update user data
   │             │
   │             └─→ Redirect to /chat
   │
   └─→ Error → Show error message


4. LOGIN (/login)
   │
   ┌──────────────────────────┐
   │  Login Form              │
   │  ├─ Email                │
   │  └─ Password             │
   └──────────────────────────┘
   │
   │ [Sign In]
   │
   ├─→ Success → Save token & user data
   │             │
   │             ├─→ Profile Incomplete? → /profile-setup
   │             │
   │             └─→ Profile Complete? → /chat
   │
   └─→ Error → Show error message


5. CHAT INTERFACE (/chat)
   │
   ┌─────────────────────────────────────────────────────┐
   │                    CHAT LAYOUT                       │
   │  ┌──────────────────┬──────────────────────────┐   │
   │  │   CHAT WINDOW    │      USER LIST           │   │
   │  │   (Left Side)    │    (Right Sidebar)       │   │
   │  │                  │                          │   │
   │  │  ┌────────────┐  │  ┌────────────────────┐ │   │
   │  │  │ Messages   │  │  │ Search Bar         │ │   │
   │  │  │            │  │  │ [@username or name]│ │   │
   │  │  │ [Message1] │  │  └────────────────────┘ │   │
   │  │  │ [Message2] │  │                          │   │
   │  │  │ [Message3] │  │  ┌────────────────────┐ │   │
   │  │  │            │  │  │ User 1             │ │   │
   │  │  └────────────┘  │  │ @john_doe          │ │   │
   │  │                  │  ├────────────────────┤ │   │
   │  │  ┌────────────┐  │  │ User 2             │ │   │
   │  │  │ Input Box  │  │  │ @alice_smith       │ │   │
   │  │  │ [Type...]  │  │  ├────────────────────┤ │   │
   │  │  └────────────┘  │  │ User 3             │ │   │
   │  │                  │  │ @developer_mike    │ │   │
   │  │                  │  └────────────────────┘ │   │
   │  └──────────────────┴──────────────────────────┘   │
   └─────────────────────────────────────────────────────┘
```

## Feature Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH FUNCTIONALITY                          │
└─────────────────────────────────────────────────────────────────┘

User types in search box
   │
   ├─→ Query < 2 chars → Show all users
   │
   └─→ Query ≥ 2 chars → Debounce 300ms
       │
       └─→ API Call: GET /api/messages/search?query=...
           │
           ├─→ Search in: customId, username, displayName
           │
           └─→ Return matching users (max 20)
               │
               └─→ Display results in user list


┌─────────────────────────────────────────────────────────────────┐
│              CUSTOM ID VALIDATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User types custom ID
   │
   ├─→ Length < 3 → Show error
   │
   ├─→ Invalid chars → Show error
   │
   └─→ Valid format → Debounce 500ms
       │
       └─→ API Call: GET /api/profile/check-id/:customId
           │
           ├─→ Available → Show ✓ green message
           │               Enable submit button
           │
           └─→ Taken → Show ✗ red message
                       Disable submit button


┌─────────────────────────────────────────────────────────────────┐
│                   REAL-TIME MESSAGING                            │
└─────────────────────────────────────────────────────────────────┘

User A sends message
   │
   ├─→ HTTP POST /api/messages/send
   │   └─→ Save to database
   │
   └─→ Socket.IO emit 'send-message'
       │
       ├─→ Server receives
       │   │
       │   └─→ Emit 'receive-message' to User B
       │       │
       │       └─→ User B sees message instantly
       │
       └─→ Emit 'message-sent' to User A
           │
           └─→ User A sees confirmation
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH STORE (Zustand)                          │
└─────────────────────────────────────────────────────────────────┘

State:
├─ user: {
│    id, customId, username, displayName,
│    email, avatar, bio, profileCompleted
│  }
├─ token: "jwt_token_here"

Actions:
├─ setAuth(user, token)     → Login/Register
├─ setUser(user)            → Update profile
└─ logout()                 → Clear session


┌─────────────────────────────────────────────────────────────────┐
│                    CHAT STORE (Zustand)                          │
└─────────────────────────────────────────────────────────────────┘

State:
├─ currentChat: "userId"
├─ messages: [...]
├─ users: [...]

Actions:
├─ setCurrentChat(userId, userData)
├─ setMessages(messages)
├─ addMessage(message)
└─ clearChat()
```

## API Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Frontend                    Backend                    Database
   │                          │                           │
   │  POST /api/auth/register │                           │
   ├─────────────────────────→│                           │
   │                          │  Check if email exists    │
   │                          ├──────────────────────────→│
   │                          │←──────────────────────────┤
   │                          │  Hash password            │
   │                          │  Create user              │
   │                          ├──────────────────────────→│
   │                          │←──────────────────────────┤
   │                          │  Generate JWT             │
   │←─────────────────────────┤                           │
   │  { token, user }         │                           │
   │                          │                           │
   │  Store in localStorage   │                           │
   │  Redirect to /profile-setup                          │


┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE SETUP FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Frontend                    Backend                    Database
   │                          │                           │
   │  GET /api/profile/check-id/:customId                 │
   ├─────────────────────────→│                           │
   │                          │  Query customId           │
   │                          ├──────────────────────────→│
   │                          │←──────────────────────────┤
   │←─────────────────────────┤                           │
   │  { available: true }     │                           │
   │                          │                           │
   │  POST /api/profile/setup │                           │
   ├─────────────────────────→│                           │
   │                          │  Validate customId        │
   │                          │  Update user              │
   │                          ├──────────────────────────→│
   │                          │←──────────────────────────┤
   │←─────────────────────────┤                           │
   │  { user }                │                           │
   │                          │                           │
   │  Update store            │                           │
   │  Redirect to /chat       │                           │


┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGING FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User A                      Server                      User B
   │                          │                           │
   │  Socket: send-message    │                           │
   ├─────────────────────────→│                           │
   │                          │  Save to DB               │
   │                          │  Emit: receive-message    │
   │                          ├──────────────────────────→│
   │                          │                           │  Display
   │  Emit: message-sent      │                           │  message
   │←─────────────────────────┤                           │
   │                          │                           │
   │  Display confirmation    │                           │
```

## Mobile Responsive Behavior

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESKTOP VIEW (≥1024px)                        │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────┬──────────────────────────────┐  │
│  │     CHAT WINDOW          │       USER LIST              │  │
│  │     (Always visible)     │    (Always visible)          │  │
│  │                          │                              │  │
│  └──────────────────────────┴──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE VIEW (<1024px)                         │
└─────────────────────────────────────────────────────────────────┘

No chat selected:
┌──────────────────────┐
│    USER LIST         │
│    (Full screen)     │
│                      │
└──────────────────────┘

Chat selected:
┌──────────────────────┐
│   CHAT WINDOW        │
│   (Full screen)      │
│   [Back button]      │
│                      │
└──────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

Registration Errors:
├─ Email already exists → "کاربر قبلاً ثبت‌نام کرده است"
├─ Password too short → "رمز عبور باید حداقل ۶ کاراکتر باشد"
└─ Network error → "خطای سرور"

Profile Setup Errors:
├─ Custom ID taken → "این شناسه قبلاً استفاده شده است"
├─ Invalid format → "فقط حروف انگلیسی کوچک، اعداد و _ مجاز است"
├─ Too short → "شناسه باید بین ۳ تا ۳۰ کاراکتر باشد"
└─ Network error → "خطا در ایجاد پروفایل"

Login Errors:
├─ Invalid credentials → "ایمیل یا رمز عبور اشتباه است"
├─ Missing fields → "ایمیل و رمز عبور الزامی است"
└─ Network error → "خطای سرور"

Chat Errors:
├─ Socket disconnected → Attempt reconnection
├─ Message send failed → Show retry option
└─ User not found → "کاربر یافت نشد"
```

---

This flow diagram shows the complete user journey through the application, from registration to chatting with other users.
