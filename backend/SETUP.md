# Backend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment configuration:

```bash
cp config/development.env .env
```

3. Update `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatbox
DB_NAME=chatbox

# JWT (Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production

# Email Configuration (Optional - for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (Optional - for phone verification)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone number
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Users

- `GET /api/users` - Get all users (Admin/Moderator)
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/profile` - Update current user profile
- `PATCH /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Chat

- `POST /api/chat` - Create new chat
- `GET /api/chat` - Get user's chats
- `GET /api/chat/:id` - Get chat by ID
- `GET /api/chat/:id/history` - Get chat history
- `POST /api/chat/message` - Send message
- `POST /api/chat/search` - Search messages
- `POST /api/chat/:id/read` - Mark messages as read
- `DELETE /api/chat/:id` - Delete chat

## Database Schema

### User Schema

```typescript
{
  email: string (unique)
  password: string (hashed)
  username: string
  phoneNumber?: string
  role: UserRole (user, admin, moderator)
  emailVerification: VerificationStatus
  phoneVerification: VerificationStatus
  avatar?: string
  isActive: boolean
  lastLoginAt?: Date
  refreshToken?: string
}
```

### Chat Schema

```typescript
{
  name: string
  participants: ObjectId[]
  createdBy: ObjectId
  messages: Message[]
  lastMessage?: Message
  lastMessageAt?: Date
  isGroup: boolean
  avatar?: string
  isActive: boolean
}
```

### Message Schema

```typescript
{
  senderId: ObjectId
  content: string
  type: MessageType (text, image, voice, file)
  attachmentUrl?: string
  attachmentName?: string
  attachmentSize?: number
  isEdited: boolean
  isDeleted: boolean
  readBy: ObjectId[]
  metadata?: object
}
```

## Testing

Run unit tests:

```bash
npm run test
```

Run e2e tests:

```bash
npm run test:e2e
```

## MongoDB Connection

Make sure MongoDB is running on your system:

```bash
# Start MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Connect to MongoDB:

```bash
mongosh "mongodb://localhost:27017"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration settings

3. **Email/SMS Verification**
   - Configure email/SMS credentials in .env
   - Test with valid credentials

4. **CORS Issues**
   - Update CORS_ORIGIN in .env
   - Ensure frontend URL matches

## Production Deployment

1. Set NODE_ENV=production
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment-specific MongoDB
6. Configure proper logging
7. Set up monitoring and health checks
