# API Contract: User Registration

**Endpoint**: `POST /api/v1/auth/register`

**Version**: 1.0.0

**Status**: Ready for Implementation

---

## Purpose

Allow new users to create an account with email and password. Validates inputs, prevents duplicate emails, hashes password securely, and returns JWT token for immediate access.

---

## Request

### Method & Path
```
POST /api/v1/auth/register
```

### Headers
```
Content-Type: application/json
```

### Body

**Type**: JSON Object

**Required Fields**:
| Field | Type | Constraints | Example |
|-------|------|-----------|---------|
| `email` | string | Valid RFC 5322 format, max 254 characters | `alice@example.com` |
| `password` | string | Minimum 8 characters, maximum 128 | `SecurePass123!` |

**Example**:
```json
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

### Validation Rules (Backend)

- **email**:
  - Required: Cannot be null, undefined, or empty string
  - Format: Must match RFC 5322 (contains @, valid domain)
  - Uniqueness: No existing user with same email (case-insensitive)
  - Max length: 254 characters
  - Stored as: Lowercase

- **password**:
  - Required: Cannot be null, undefined, or empty string
  - Length: Minimum 8 characters, maximum 128 characters
  - Special characters allowed
  - No complexity requirements for v1

---

## Successful Response

### Status Code: `201 Created`

### Headers
```
Content-Type: application/json
```

### Body

**Type**: JSON Object with user data and auth token

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com"
  }
}
```

### Field Details

| Field | Type | Description |
|-------|------|-----------|
| `token` | string | JWT token for authenticated requests; valid for 24 hours |
| `user.id` | string | MongoDB ObjectId as string (24 hex chars) |
| `user.email` | string | Registered email address (lowercase) |

### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWF0IjoxNzE3MTc2NjAwLCJleHAiOjE3MTcyNjMwMDB9.signature",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com"
  }
}
```

---

## Error Responses

### 400 Bad Request

**When**: Validation fails (invalid email format, short password, missing field)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "error": "ValidationError",
  "message": "Invalid email format",
  "statusCode": 400
}
```

**Possible Messages**:
- "Invalid email format" — Email doesn't match RFC 5322
- "Password must be at least 8 characters" — Password too short
- "Email is required" — Missing email field
- "Password is required" — Missing password field

---

### 409 Conflict

**When**: Email already registered

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "error": "DuplicateEmail",
  "message": "Email already registered",
  "statusCode": 409
}
```

---

### 500 Internal Server Error

**When**: Server error (e.g., MongoDB connection failure)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "error": "ServerError",
  "message": "Database connection failed",
  "statusCode": 500
}
```

---

## Implementation Notes

1. **Password Security**: Password MUST be hashed with bcryptjs (salt rounds 10) before storage. Never store plaintext.
2. **Email Normalization**: Convert email to lowercase before checking uniqueness and storing.
3. **Token Generation**: JWT payload should include `userId`, `email`, `iat` (issued at), and `exp` (expiry = 24 hours).
4. **Duplicate Check**: Use MongoDB unique index + application-level error handling for duplicate key violations.
5. **Concurrency**: MongoDB unique index prevents race condition where two simultaneous requests create same email.

---

## Testing

**Success Case**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123!"}'

# Expected: 201 with token and user
```

**Duplicate Email**:
```bash
# Register same email twice
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123!"}'

# Second request should return 409
```

**Invalid Email**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid.email","password":"SecurePass123!"}'

# Expected: 400 with "Invalid email format"
```

**Short Password**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"short"}'

# Expected: 400 with "Password must be at least 8 characters"
```
