# Implementation Plan: User Authentication (Login & Register)

**Branch**: `001-basic-login` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-basic-login/spec.md`

## Summary

Implement user authentication system for Cardekho with email-password registration and login. MongoDB stores hashed credentials via bcryptjs. Backend exposes REST API endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`) returning JWT tokens. Frontend provides register/login form as default landing page with token-based session management. Simple, minimal implementation following Cardekho architecture (MVC backend, standalone Angular components, shared HTTP service).

## Technical Context

**Language/Version**: TypeScript; Bun runtime (backend), Node.js ecosystem; Angular 18+ (frontend)

**Primary Dependencies**: 
- Backend: Hono 4.x (HTTP framework), Mongoose 7.x (MongoDB ODM), bcryptjs 2.4.x (password hashing), jsonwebtoken 9.x (JWT), dotenv 16.x
- Frontend: Angular 18+, RxJS 7.x, ng-bootstrap 14.x

**Storage**: MongoDB (Atlas or local instance) with connection string in `.env.local`

**Testing**: Vitest (backend unit tests), Jasmine (frontend component tests); minimum 80% coverage for new code

**Target Platform**: Web browser (modern: Chrome, Firefox, Safari, Edge); backend on Bun runtime

**Project Type**: Full-stack web application (separate API backend + web frontend)

**Performance Goals**: 
- API response <200ms (register/login endpoints)
- Frontend initial page load <2s
- Client-side form validation <100ms

**Constraints**: 
- No OAuth/SSO integrations for v1
- Email case-insensitive (stored lowercase)
- Password minimum 8 characters
- JWT TTL: 24 hours
- No rate limiting for v1

**Scale/Scope**: Up to 10k users; 2 API endpoints; 2 frontend pages (shared component); 1 MongoDB collection

## Constitution Check

✅ **GATE PASSED** — No violations. Architecture fully aligned with Cardekho v1.0.0

| Principle | Requirement | Status |
|-----------|-------------|--------|
| Clean Code & Readability | Descriptive names, <100 char lines | ✅ Enforced in PR review |
| JSDoc Documentation | All exports documented | ✅ Mandatory in code review |
| MVC Architecture | Backend folder structure | ✅ models/, controllers/, routers/, utils/ |
| Lean Components | <200 lines per component | ✅ Auth = 1 component (~80 lines) |
| Testing & Gates | 80% coverage, tests before merge | ✅ Unit tests required |
| Backend Constraints | Semantic HTTP codes, consistent errors | ✅ Enforced in controller design |
| Frontend Constraints | Standalone components, no direct HTTP | ✅ HTTP interceptor enforced |

## Project Structure

### Documentation (this feature)

```text
specs/001-basic-login/
├── plan.md              # This file (implementation plan)
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model design
├── quickstart.md        # Phase 1 quick start guide
├── contracts/           # Phase 1 API contracts
│   ├── register.contract.md
│   ├── login.contract.md
│   └── auth.types.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (Web Application: Separate Backend + Frontend)

**Backend** (`cardekho.api/`):
```text
src/
├── models/
│   └── user.model.ts              # Mongoose schema: email, passwordHash, createdAt
├── controllers/
│   └── auth.controller.ts         # HTTP handlers: register, login
├── services/
│   └── auth.service.ts            # Business logic: user creation, token generation
├── routers/
│   └── auth.router.ts             # POST /api/v1/auth/register, /api/v1/auth/login
├── middleware/
│   └── auth.middleware.ts         # JWT verification for protected routes
├── utils/
│   ├── encrypt.utils.ts           # bcryptjs hash/compare
│   ├── validate.utils.ts          # Email, password validation
│   ├── response.utils.ts          # Standardized error/success responses
│   └── interfaces/
│       ├── user.interface.ts      # IUser, IUserDocument
│       └── auth.interface.ts      # IRegisterReq, ILoginReq, IAuthResponse
├── index.ts                       # Main app entry point
└── .env.local                     # MONGODB_URI, JWT_SECRET, JWT_EXPIRY
```

**Frontend** (`cardekho.web/cardekho.web/src/app/`):
```text
├── auth/
│   ├── components/
│   │   ├── register-login.component.ts        # Standalone: email/password form, toggle mode
│   │   ├── register-login.component.html      # Template: form inputs, error display
│   │   └── register-login.component.scss      # Scoped styles
│   └── services/
│       └── auth.service.ts                    # Backend API calls, token storage/retrieval
├── shared/
│   ├── services/
│   │   └── http.service.ts                    # Base HTTP client with interceptor
│   └── guards/
│       └── auth.guard.ts                      # Route guard: redirect if not authenticated
├── core/
│   └── app.config.ts                          # App-wide configuration
├── app.routes.ts                              # Route definitions
└── app.ts                                     # Root component
```

**Structure Decision**: Web application with Bun/Hono backend (MVC) and Angular frontend (modular, standalone). Authentication handled via JWT stored in localStorage with HTTP interceptor. All HTTP calls routed through shared service per Cardekho constitution.

---

## Phase 0: Research & Technical Decisions

### Authentication Method: JWT (JSON Web Tokens) ✅

**Decision**: Stateless token-based authentication

**Rationale**: 
- Scalable (no server-side session storage)
- Standard for REST APIs
- Easy to implement in Hono
- Natural fit for SPA frontend (store in localStorage)

**Implementation**:
- Backend generates JWT on login/register with payload: `{ userId, email, iat, exp }`
- Token TTL: 24 hours
- Frontend stores in localStorage
- All requests include token in `Authorization: Bearer {token}` header via HTTP interceptor
- Backend middleware verifies token on protected routes

**Alternatives considered**:
- Session-based (server-side state): More complex, requires session store, not ideal for stateless API
- OAuth/SAML: Out of scope for v1, excessive complexity

### Password Hashing: bcryptjs ✅

**Decision**: bcryptjs v2.4.x with salt rounds 10

**Rationale**:
- Industry standard, battle-tested
- Slow hash function resistant to brute force
- Auto salt generation
- No external dependencies beyond npm package

**Implementation**:
- Hash password on registration: `bcrypt.hash(password, 10)`
- Verify on login: `bcrypt.compare(inputPassword, storedHash)`
- Never store plaintext passwords

**Alternatives considered**:
- argon2: More secure but heavier dependency, overkill for MVP
- PBKDF2: Slower, more configuration needed
- scrypt: More complex, not needed for v1

### Email Validation: RFC 5322 ✅

**Decision**: Simple regex validation + MongoDB unique index

**Rationale**:
- User spec requires RFC 5322 format compliance
- Simple regex sufficient for MVP validation
- MongoDB unique index enforces at DB level

**Implementation**:
- Frontend validation: regex check in component
- Backend validation: regex check + duplicate email catch from MongoDB
- Email stored as lowercase (normalize before storage)

**Alternatives considered**:
- email-validator npm package: More robust but adds dependency
- OTP verification: Out of scope for v1

### Session Persistence: localStorage + HTTP Interceptor ✅

**Decision**: Store JWT in localStorage, auto-inject in all requests

**Rationale**:
- Persists across browser restarts
- Survives page refresh (user remains logged in)
- HTTP interceptor handles automatic injection
- Simple implementation for MVP

**Implementation**:
- AuthService saves JWT to localStorage after login
- HTTP interceptor reads token, adds to Authorization header
- On logout: remove token from localStorage
- On app init: check localStorage for token, validate if present

**Alternatives considered**:
- sessionStorage: Cleared on browser close, not persistent
- cookies: Simpler but CORS complexity
- in-memory: Lost on refresh, poor UX

### Error Response Format: Standardized JSON ✅

**Decision**: Consistent error object structure

**Rationale**: Frontend expects predictable error format for UX messaging

**Implementation**:
```json
{
  "error": "InvalidCredentials",
  "message": "Email or password incorrect",
  "statusCode": 401
}
```

**Used for**: Validation errors (400), duplicate email (409), invalid credentials (401), server errors (500)

---

## Phase 1: Design Artifacts (Generated Below)

### Data Model Design

**File**: `data-model.md`

**User Entity**:
- `_id`: ObjectId (auto-generated by MongoDB)
- `email`: String, required, unique, lowercase
- `passwordHash`: String, required (bcryptjs output)
- `createdAt`: Date, auto-set to now()

**Indexes**:
- `email` (unique)
- `createdAt` (for potential future queries)

### API Contracts

**File**: `contracts/register.contract.md`

**Endpoint**: `POST /api/v1/auth/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses**:
- 400: Validation error (invalid email, short password)
- 409: Duplicate email already registered
- 500: Server error

---

**File**: `contracts/login.contract.md`

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses**:
- 400: Validation error (missing email/password)
- 401: Invalid email or password
- 500: Server error

### Frontend Routes & Components

**File**: `quickstart.md`

**Routes**:
- `/login` → Register/login form (shared component, mode toggle)
- `/dashboard` → Protected route (example; shows "logged in")
- `/` (root) → Redirect to `/login` if not authenticated, `/dashboard` if authenticated

**Auth Component**:
- Standalone Angular component
- <100 lines
- Handles both register and login via mode toggle
- Form validation (email format, password length)
- Error display from backend
- On success: store token, navigate to dashboard

---

## Agent Context Update

**File**: `.github/copilot-instructions.md`

Will update `<!-- SPECKIT START -->` section to reference this plan file for developer guidance during implementation.

---

**✅ Plan Complete** — Ready for `/speckit.tasks` to generate implementation tasks

**Version**: 1.0.0 | **Branch**: `001-basic-login` | **Created**: 2026-05-31
