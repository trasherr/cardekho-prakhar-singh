# API Types & Interfaces

**Feature**: User Authentication  
**Version**: 1.0.0  
**Date**: 2026-05-31

---

## Backend TypeScript Interfaces

### User Model

```typescript
/**
 * User document in MongoDB
 */
interface IUser {
  _id?: string | ObjectId;
  email: string;           // Unique, lowercase
  passwordHash: string;    // bcryptjs hash output
  createdAt?: Date;
}

interface IUserDocument extends IUser, Document {}
```

### Authentication Requests

```typescript
/**
 * User registration request
 */
interface IRegisterReq {
  email: string;
  password: string;
}

/**
 * User login request
 */
interface ILoginReq {
  email: string;
  password: string;
}
```

### Authentication Response

```typescript
/**
 * Response returned on successful register or login
 */
interface IAuthResponse {
  token: string;           // JWT token
  user: {
    id: string;            // User ID as string
    email: string;         // User email (lowercase)
  };
}
```

### Error Response

```typescript
/**
 * Standard error response
 */
interface IErrorResponse {
  error: string;           // Error code (e.g., "ValidationError", "InvalidCredentials")
  message: string;         // Human-readable message
  statusCode: number;      // HTTP status code
}
```

### JWT Payload

```typescript
/**
 * JWT token payload
 */
interface IJWTPayload {
  userId: string;          // User ID from MongoDB
  email: string;           // User email
  iat: number;            // Issued At (Unix timestamp)
  exp: number;            // Expiration (Unix timestamp, 24h after iat)
}
```

---

## Frontend TypeScript Interfaces

### Auth Service Response

```typescript
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthError {
  error: string;
  message: string;
  statusCode: number;
}
```

### Authentication State

```typescript
export interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}
```

---

## HTTP Status Codes

| Code | Name | Scenario |
|------|------|----------|
| 200 | OK | Login successful |
| 201 | Created | Registration successful |
| 400 | Bad Request | Validation error (invalid email, short password, missing field) |
| 401 | Unauthorized | Invalid credentials (login), invalid token (protected route) |
| 409 | Conflict | Email already registered |
| 500 | Internal Server Error | Server/database error |

---

## Error Code Reference

| Error Code | HTTP Status | Context | Message Example |
|----------|----------|---------|----------|
| `ValidationError` | 400 | Invalid input | "Invalid email format" |
| `PasswordTooShort` | 400 | Password <8 chars | "Password must be at least 8 characters" |
| `MissingField` | 400 | Missing email/password | "Email is required" |
| `DuplicateEmail` | 409 | Email already exists | "Email already registered" |
| `InvalidCredentials` | 401 | Wrong password or email | "Invalid email or password" |
| `Unauthorized` | 401 | Missing/invalid token | "Unauthorized" |
| `ServerError` | 500 | Database or server issue | "Database connection failed" |

---

## Validation Rules

### Email Validation

- **RFC 5322**: Must contain @ symbol and valid domain
- **Length**: Max 254 characters
- **Case**: Stored and compared as lowercase
- **Uniqueness**: Cannot duplicate existing user email
- **Format Regex** (simple): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Password Validation

- **Length**: Minimum 8, maximum 128 characters
- **Characters**: Any printable ASCII character allowed
- **Complexity**: No special requirements for v1
- **Storage**: Always hashed with bcryptjs (salt rounds 10), never stored plaintext

### Token Validation

- **Format**: JWT (JSON Web Token)
- **Signature**: HS256 (HMAC with SHA-256)
- **Expiry**: 24 hours from issue time
- **Payload**: Contains `userId`, `email`, `iat`, `exp`
- **Storage**: Client-side localStorage
- **Transmission**: HTTP `Authorization: Bearer {token}` header

---

## Examples

### Successful Register

**Request**:
```json
POST /api/v1/auth/register
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**Response (201)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com"
  }
}
```

### Successful Login

**Request**:
```json
POST /api/v1/auth/login
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com"
  }
}
```

### Error: Invalid Email

**Request**:
```json
POST /api/v1/auth/register
{
  "email": "invalid.email",
  "password": "SecurePass123!"
}
```

**Response (400)**:
```json
{
  "error": "ValidationError",
  "message": "Invalid email format",
  "statusCode": 400
}
```

### Error: Duplicate Email

**Request** (second register with same email):
```json
POST /api/v1/auth/register
{
  "email": "alice@example.com",
  "password": "AnotherPass123!"
}
```

**Response (409)**:
```json
{
  "error": "DuplicateEmail",
  "message": "Email already registered",
  "statusCode": 409
}
```

### Error: Invalid Credentials

**Request**:
```json
POST /api/v1/auth/login
{
  "email": "alice@example.com",
  "password": "WrongPassword!"
}
```

**Response (401)**:
```json
{
  "error": "InvalidCredentials",
  "message": "Invalid email or password",
  "statusCode": 401
}
```
