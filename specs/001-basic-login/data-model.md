# Data Model: User Authentication

**Feature**: Basic Login (001-basic-login)  
**Version**: 1.0.0  
**Date**: 2026-05-31

## Overview

Simple authentication system with single entity: **User** (MongoDB collection). Passwords hashed via bcryptjs. Session managed via JWT tokens (stateless).

---

## Entities

### User

**Collection**: `users`

**Purpose**: Store registered user accounts with email and hashed password

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| `_id` | ObjectId | Primary key, auto-generated | MongoDB auto-creates on insert |
| `email` | String | Required, Unique, Lowercase | Normalized to lowercase before storage; used as login identifier |
| `passwordHash` | String | Required, Non-empty | Output of `bcrypt.hash(password, 10)` — never store plaintext |
| `createdAt` | Date | Required, Auto-set | Timestamp of registration; used for auditing |

**Indexes**:
```javascript
// Unique index on email (prevents duplicates)
db.users.createIndex({ email: 1 }, { unique: true })

// Optional: Index on createdAt for future queries (user list, analytics)
db.users.createIndex({ createdAt: 1 })
```

**Validation Rules**:

| Field | Rule | Example |
|-------|------|---------|
| `email` | RFC 5322 format; must contain @ and domain | `user@example.com` ✅; `invalid.email` ❌ |
| `passwordHash` | Non-empty string; minimum 60 characters (bcryptjs output) | bcryptjs always produces 60-char hash |
| `createdAt` | ISO 8601 date; must be ≤ now | `2026-05-31T14:30:00Z` ✅ |

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "alice@example.com",
  "passwordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMye3dG9SWndnfh.tqT9fFZL.CJSfdLF6cW",
  "createdAt": ISODate("2026-05-31T14:30:00Z")
}
```

---

### Car

**Collection**: `cars`

**Purpose**: Store second-hand car listings used by the marketplace pages and seed data.

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary key, auto-generated | MongoDB auto-creates on insert |
| `car_name` | String | Required | Full display name from dataset |
| `brand` | String | Required | Manufacturer/brand |
| `model` | String | Optional | Model name |
| `vehicle_age` | Number | Required | In years |
| `km_driven` | Number | Required | Integer kilometers driven |
| `seller_type` | String | Optional | e.g., Individual, Dealer |
| `fuel_type` | String | Optional | e.g., Petrol, Diesel, CNG |
| `transmission_type` | String | Optional | e.g., Manual, Automatic |
| `mileage` | Number | Optional | Fuel efficiency (kmpl) |
| `engine` | Number | Optional | Engine displacement (cc) |
| `max_power` | Number | Optional | Max power in bhp or kW per dataset |
| `seats` | Number | Optional | Number of seats |
| `selling_price` | Number | Required | Price in local currency |

**Indexes**:
```javascript
// Indexes to support listing and filtering
db.cars.createIndex({ brand: 1 })
db.cars.createIndex({ model: 1 })
db.cars.createIndex({ selling_price: 1 })
db.cars.createIndex({ km_driven: 1 })
```

**Example Document**:
```json
{
  "_id": ObjectId("60d5ec49f1d2c8a1b2c3d4e5"),
  "car_name": "Maruti Alto",
  "brand": "Maruti",
  "model": "Alto",
  "vehicle_age": 9,
  "km_driven": 120000,
  "seller_type": "Individual",
  "fuel_type": "Petrol",
  "transmission_type": "Manual",
  "mileage": 19.7,
  "engine": 796,
  "max_power": 46.3,
  "seats": 5,
  "selling_price": 120000
}
```


## Relationships & Dependencies

**None** for v1. User entity is standalone.

**Future relationships** (out of scope):
- User → Cars (one-to-many): User can list multiple cars
- User → Listings (one-to-many): User can post multiple listings
- User → Saved Cars (many-to-many): User can save favorite cars

---

## Authentication Token (Implicit via JWT)

**Not persisted** to database (stateless). JWT payload structure:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "alice@example.com",
  "iat": 1717176600,
  "exp": 1717263000
}
```

- **iat** (issued at): Unix timestamp
- **exp** (expires): Unix timestamp (24 hours after iat)
- **Stored**: Client-side localStorage as string
- **Transmitted**: HTTP `Authorization: Bearer {token}` header

---

## State Transitions

**User Lifecycle**:

```
[Not Registered]
     ↓
   Register (email + password) → Hash password with bcryptjs
     ↓
[Registered, Inactive] → User enters credentials
     ↓
   Login (validate email + password match hash)
     ↓
[Authenticated] → JWT issued, stored in localStorage
     ↓
   ← Access protected routes with valid JWT
     ↓
   JWT expires (24 hours) → Redirect to login
     ↓
[Logged Out]
```

---

## Data Validation Rules (Backend)

**Registration**:
- Email: Must match RFC 5322 regex; must be unique in collection
- Password: Minimum 8 characters; maximum 128 characters
- Both fields required (not null/undefined/empty string)

**Login**:
- Email: Must match RFC 5322 regex
- Password: Minimum 8 characters; maximum 128 characters
- Both fields required

**Duplicate Prevention**:
- MongoDB unique index + application-level catch of duplicate key error
- Error returned to frontend: HTTP 409 Conflict

**Password Security**:
- Never stored plaintext
- Always hashed with bcryptjs (salt rounds: 10)
- Compared using `bcrypt.compare()` (constant-time comparison)

---

## Constraints & Assumptions

- **Email case-insensitivity**: Email stored as lowercase; comparison case-insensitive
- **Password length**: 8-128 characters (min/max)
- **Token TTL**: 24 hours
- **No password recovery** for v1 (out of scope)
- **No multi-session** per user (each login invalidates previous token)
- **No account lock-out** on failed login attempts for v1

---

## Future Enhancements (Out of Scope v1)

- Password reset via email verification
- Two-factor authentication (2FA)
- Account lock-out after N failed attempts
- Session management (list active sessions, revoke sessions)
- Social authentication (OAuth, SAML)
- Role-based access control (RBAC)
