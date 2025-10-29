# Cấu trúc dự án Chatbox V1

## Tổng quan

```
chatboxV1/
├── backend/                 # NestJS Backend API
├── frontend/               # React TypeScript Frontend
├── shared/                 # Shared types và utilities
├── docs/                   # Documentation
├── package.json            # Root package.json
└── README.md              # Project documentation
```

## Backend Structure (NestJS)

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── guards/        # Auth guards
│   │   ├── strategies/    # JWT strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── chat/              # Chat module
│   │   ├── dto/           # Chat DTOs
│   │   ├── entities/      # Chat entities
│   │   ├── gateways/      # Socket.io gateways
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   └── chat.module.ts
│   ├── users/             # Users module
│   │   ├── dto/           # User DTOs
│   │   ├── entities/      # User entities
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── common/            # Common utilities
│   │   ├── decorators/    # Custom decorators
│   │   ├── filters/       # Exception filters
│   │   ├── interceptors/  # Response interceptors
│   │   ├── pipes/         # Validation pipes
│   │   └── utils/         # Utility functions
│   ├── database/          # Database configuration
│   │   ├── schemas/       # Mongoose schemas
│   │   └── database.module.ts
│   ├── uploads/           # File upload handling
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                  # E2E tests
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Frontend Structure (React TypeScript)

```
frontend/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── auth/         # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── index.ts
│   │   ├── chat/         # Chat components
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── index.ts
│   │   ├── common/       # Common components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   └── layout/       # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Footer.tsx
│   │       └── index.ts
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/    # Dashboard pages
│   │   │   ├── Chat.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── index.ts
│   │   ├── Home.tsx
│   │   └── NotFound.tsx
│   ├── services/         # API services
│   │   ├── api.ts        # Axios configuration
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   ├── user.service.ts
│   │   └── socket.service.ts
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useSocket.ts
│   │   └── useLocalStorage.ts
│   ├── context/          # React Context
│   │   ├── AuthContext.tsx
│   │   ├── ChatContext.tsx
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── types/            # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── chat.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   ├── assets/           # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── public/
```

## Shared Structure

```
shared/
├── types/                # Shared TypeScript types
│   ├── auth.types.ts
│   ├── chat.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── constants/            # Shared constants
│   ├── api.constants.ts
│   ├── auth.constants.ts
│   └── chat.constants.ts
└── utils/                # Shared utilities
    ├── validation.ts
    ├── formatters.ts
    └── helpers.ts
```

## Database Schema (MongoDB)

```
Collections:
├── users                  # User information
├── chats                  # Chat rooms/conversations
├── messages              # Individual messages
├── attachments           # File attachments
└── search_index          # Search index for messages
```

## API Endpoints

```
Authentication:
├── POST /auth/register           # User registration
├── POST /auth/login              # User login
├── POST /auth/logout             # User logout
├── POST /auth/verify-email       # Email verification
├── POST /auth/verify-phone       # Phone verification
├── POST /auth/refresh-token      # Refresh JWT token
└── GET  /auth/profile            # Get user profile

Chat:
├── GET  /chat/history            # Get chat history
├── POST /chat/send               # Send message
├── GET  /chat/search             # Search messages
├── POST /chat/upload             # Upload file
├── GET  /chat/rooms              # Get chat rooms
└── POST /chat/rooms              # Create chat room

Users:
├── GET  /users/profile           # Get user profile
├── PUT  /users/profile           # Update user profile
├── GET  /users/search            # Search users
└── POST /users/avatar            # Upload avatar
```

## Features Implementation

```
✅ Authentication:
   - Email/Phone registration
   - JWT-based authentication
   - Role-based access control
   - Email/Phone verification

✅ Chat System:
   - Real-time messaging (Socket.io)
   - Message history storage
   - File upload support
   - Message search functionality

✅ Search Features:
   - Text search in messages
   - Image search (OCR/metadata)
   - Voice message search
   - Advanced filtering

✅ User Management:
   - User profiles
   - Avatar upload
   - Settings management
   - Activity tracking
```
