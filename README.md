# NestJS Starter Backend with OAuth

A comprehensive NestJS starter backend featuring authentication, authorization, OAuth social login, and role-based access control (RBAC).

## Features

- 🔐 **Authentication & Authorization**
  - Email/Password authentication
  - JWT token-based authentication
  - OAuth social login (Google, LinkedIn)
  - Role-based access control (RBAC)
  - Permission-based access control

- 🛡️ **Security**
  - CORS configuration
  - Helmet for security headers
  - Rate limiting/throttling
  - Input validation
  - Password hashing with bcrypt

- 📚 **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API explorer

- 🗄️ **Database**
  - TypeORM with MySQL
  - Entity relationships
  - Database seeding

- 🚀 **Development Features**
  - Hot reload
  - Environment configuration
  - Validation pipes
  - Error handling

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- OAuth credentials (Google, LinkedIn) - optional

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Configuration:**
Copy `.env.example` to `.env` and update the values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=nestjs_starter

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# App Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. **Database Setup:**
Create a MySQL database with the name specified in `DB_NAME`.

4. **Start the application:**
```bash
npm run start:dev
```

The application will be available at:
- API: http://localhost:3000/api/v1
- Swagger Documentation: http://localhost:3000/api/docs

## Default Users

The application seeds the following default users:

| Email | Password | Role |
|-------|----------|------|
| user@example.com | password123 | user |
| admin@example.com | admin123 | admin |
| superadmin@example.com | superadmin123 | super-admin |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/linkedin` - LinkedIn OAuth login

### Users
- `GET /api/v1/users` - Get all users (Admin)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/:id` - Get user by ID (Admin)
- `PATCH /api/v1/users/me` - Update profile
- `PATCH /api/v1/users/:id` - Update user (Admin)
- `DELETE /api/v1/users/:id` - Delete user (Super Admin)

### Roles
- `GET /api/v1/roles` - Get all roles (Admin)
- `POST /api/v1/roles` - Create role (Admin)
- `GET /api/v1/roles/:id` - Get role by ID (Admin)
- `PATCH /api/v1/roles/:id` - Update role (Admin)
- `DELETE /api/v1/roles/:id` - Delete role (Super Admin)

### Permissions
- `GET /api/v1/permissions` - Get all permissions (Admin)
- `POST /api/v1/permissions` - Create permission (Super Admin)
- `GET /api/v1/permissions/:id` - Get permission by ID (Admin)
- `PATCH /api/v1/permissions/:id` - Update permission (Super Admin)
- `DELETE /api/v1/permissions/:id` - Delete permission (Super Admin)

## Authorization

### Roles
- **user**: Basic user role with limited permissions
- **admin**: Administrator role with elevated permissions
- **super-admin**: Full access to all system features

### Guards
- `JwtAuthGuard`: Protects routes requiring authentication
- `RolesGuard`: Protects routes based on user roles
- `PermissionsGuard`: Protects routes based on specific permissions

### Decorators
- `@Auth(...roles)`: Combines JWT authentication with role-based access
- `@RequirePermissions(...permissions)`: Requires specific permissions
- `@GetUser()`: Injects the current user into the route handler

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`

### LinkedIn OAuth
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new app
3. Add product: "Sign In with LinkedIn"
4. Add authorized redirect URI: `http://localhost:3000/auth/linkedin/callback`

## Project Structure

```
src/
├── config/           # Configuration files
├── decorators/       # Custom decorators
├── dto/             # Data Transfer Objects
├── entities/        # TypeORM entities
├── guards/          # Authentication & authorization guards
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── user/        # User management module
│   ├── role/        # Role management module
│   └── permission/  # Permission management module
├── seed/            # Database seeding
└── strategies/      # Passport strategies
```

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Building for Production
```bash
npm run build
npm run start:prod
```

### Linting and Formatting
```bash
npm run lint
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
