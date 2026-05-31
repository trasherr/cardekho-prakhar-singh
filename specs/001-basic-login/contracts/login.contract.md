# API Contract: User Login

**Endpoint**: `POST /api/v1/auth/login`

**Version**: 1.0.0

**Status**: Ready for Implementation

---

## Purpose

Authenticate a registered user with email and password. Validates credentials, returns JWT token for subsequent authenticated requests, and fails securely (no user enumeration).

---

## Request

### Method & Path
```
POST /api/v1/auth/login
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
| `email` | string | Valid email format | `alice@example.com` |
| `password` | string | Minimum 8 characters | `SecurePass123!` |

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
  - Format: Must match basic email validation (contains @)
  - Case-insensitive lookup (convert to lowercase)

- **password**:
  - Required: Cannot be null, undefined, or empty string
  - No format validation (user may have forgotten exact password)
  - Compared securely with stored hash using bcryptjs.compare()

---

## Successful Response

### Status Code: `200 OK`

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

**When**: Validation fails (missing email/password field)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "error": "ValidationError",
  "message": "Email and password are required",
  "statusCode": 400
}
```

**Possible Messages**:
- "Email is required"
- "Password is required"
- "Email and password are required"

---

### 401 Unauthorized

**When**: Credentials are invalid (email not found OR password incorrect)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "error": "InvalidCredentials",
  "message": "Invalid email or password",
  "statusCode": 401
}
```

**Note**: Server intentionally returns same message for both cases (user not found OR password wrong) to prevent user enumeration attacks. Frontend cannot determine if email is registered.

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

1. **Password Verification**: Use `bcryptjs.compare(inputPassword, storedHash)` for constant-time comparison to prevent timing attacks.
2. **Error Messages**: Always return "Invalid email or password" for security (no user enumeration).
3. **Token Generation**: JWT payload should include `userId`, `email`, `iat`, and `exp` (24 hours from now).
4. **Case-Insensitive Lookup**: Convert email to lowercase before querying database.
5. **No Account Lockout**: For v1, no lock-out after failed attempts; implement rate limiting at API gateway if needed later.

---

## Token Usage (After Successful Login)

**Store JWT**:
```javascript
localStorage.setItem('authToken', response.token);
```

**Use JWT in Protected Requests**:
```bash
curl -X GET http://localhost:3000/api/v1/protected \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Token Expiry**:
- JWT expires after 24 hours
- Frontend should handle 401 Unauthorized response and redirect to login
- Token can be refreshed by logging in again

---

## Testing

**Success Case**:
```bash
# First register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123!"}'

# Then login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123!"}'

# Expected: 200 with token and user
```

**Wrong Password**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"WrongPassword123!"}'

# Expected: 401 with "Invalid email or password"
```

**User Not Registered**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"notregistered@example.com","password":"SomePassword123!"}'

# Expected: 401 with "Invalid email or password"
```

**Missing Fields**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'

# Expected: 400 with "Password is required"
```

---

## Frontend Integration

**Example Angular Code**:
```typescript
// In auth.service.ts
login(email: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`/api/v1/auth/login`, { email, password }).pipe(
    tap(response => localStorage.setItem('authToken', response.token))
  );
}

// In login.component.ts
onSubmit() {
  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.errorMessage = err.error.message; // "Invalid email or password"
    }
  });
}
```
