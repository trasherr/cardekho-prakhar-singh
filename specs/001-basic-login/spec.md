# Feature Specification: User Authentication (Login & Register)

**Feature Branch**: `001-basic-login`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "create a basic login - take email and password only - keep it simple while following proper architecture - make login/register page default page in frontend application"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration (Priority: P1)

New users can create an account by providing email and password to access the Cardekho platform.

**Why this priority**: Registration is the first step in the user journey; without it, users cannot access the system. This is essential for MVP.

**Independent Test**: Can be tested by accessing the register page, entering email/password, and verifying account creation without depending on login functionality.

**Acceptance Scenarios**:

1. **Given** user is on the register page, **When** user enters valid email and password (8+ characters), **Then** account is created and user is redirected to login page
2. **Given** user enters invalid email format, **When** user submits form, **Then** validation error is displayed (e.g., "Invalid email format")
3. **Given** user enters duplicate email, **When** user submits form, **Then** error message is displayed (e.g., "Email already registered")
4. **Given** user enters password with less than 8 characters, **When** user submits form, **Then** validation error is displayed (e.g., "Password must be at least 8 characters")

---

### User Story 2 - User Login (Priority: P1)

Registered users can log in using their email and password to access the application.

**Why this priority**: Login is critical for authenticated user workflows; without it, users cannot access protected features.

**Independent Test**: Can be tested by accessing login page, entering valid credentials, and verifying authentication without depending on register functionality.

**Acceptance Scenarios**:

1. **Given** registered user is on login page, **When** user enters correct email and password, **Then** user is authenticated and redirected to dashboard/home
2. **Given** user enters unregistered email, **When** user submits form, **Then** error message is displayed (e.g., "Invalid email or password")
3. **Given** user enters incorrect password, **When** user submits form, **Then** error message is displayed (e.g., "Invalid email or password")
4. **Given** user is logged in, **When** user refreshes page or navigates away, **Then** user remains authenticated (session persists)

---

### User Story 3 - Default Landing Page (Priority: P1)

When users access the frontend application without authentication, they are presented with the login/register page as the default view.

**Why this priority**: Ensures unauthenticated users cannot bypass authentication; critical for application security and user flow.

**Independent Test**: Can be tested by accessing application root URL and verifying login/register page is displayed without needing to configure other features.

**Acceptance Scenarios**:

1. **Given** user is not logged in, **When** user accesses application root, **Then** login/register page is displayed
2. **Given** user is logged in, **When** user accesses login page URL, **Then** user is redirected to dashboard/home
3. **Given** user is not logged in, **When** user tries to access protected route, **Then** user is redirected to login page

---

### Edge Cases

- What happens when user submits form without email or password fields?
- How does system handle concurrent login attempts from same email?
- What happens if MongoDB connection fails during registration or login?
- How are passwords stored securely (must be hashed)?
- What happens if user tries to register/login with uppercase email addresses (should be case-insensitive)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email and password only
- **FR-002**: System MUST validate email format and password strength (minimum 8 characters)
- **FR-003**: System MUST prevent duplicate email registration
- **FR-004**: System MUST securely hash passwords before storing in database
- **FR-005**: System MUST authenticate users by validating email and hashed password
- **FR-006**: System MUST return error messages for invalid credentials (login) or validation failures (register)
- **FR-007**: System MUST issue authentication token/session upon successful login
- **FR-008**: System MUST make login/register page the default frontend page for unauthenticated users
- **FR-009**: System MUST protect authenticated routes from unauthenticated access (redirect to login)
- **FR-010**: System MUST persist user session so logged-in users remain authenticated across page refreshes

### Key Entities

- **User**: Represents a registered user with email and password hash; attributes: id (ObjectId), email (string, unique), passwordHash (string), createdAt (timestamp)
- **Session/Auth Token**: Represents user authentication state; attributes: userId (reference to User), token/sessionId, expiresAt (timestamp)

### Data Model: Car

- **Car**: Represents a second-hand car listing to be used by the marketplace pages and seed data. Attributes (from dataset):
	- `car_name` (string)
	- `brand` (string)
	- `model` (string)
	- `vehicle_age` (number)
	- `km_driven` (number)
	- `seller_type` (string)
	- `fuel_type` (string)
	- `transmission_type` (string)
	- `mileage` (number)
	- `engine` (number)
	- `max_power` (number)
	- `seats` (number)
	- `selling_price` (number)


## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can register and login within 2 minutes of accessing the application
- **SC-002**: 100% of register form submissions with valid data result in successful account creation
- **SC-003**: 100% of login attempts with correct credentials result in successful authentication
- **SC-004**: Invalid credentials are rejected 100% of the time with clear error messages
- **SC-005**: Unauthenticated users cannot access protected routes (100% redirect to login)
- **SC-006**: All passwords are securely hashed; no plaintext passwords stored in database

## Assumptions

- MongoDB connection is available via `.env.local` with connection string
- Passwords will be hashed using bcrypt or similar industry-standard library
- Authentication will use JWT tokens or session-based approach (backend decision during planning)
- Email validation follows standard RFC 5322 format
- Initial deployment target is local development; production security considerations (HTTPS, CORS, rate limiting) are out of scope for v1
- Frontend uses Angular standalone components as per Cardekho constitution
- Backend uses Bun/Hono with MVC pattern as per Cardekho constitution
- No additional fields (name, phone, etc.) required for basic login
- Password reset functionality is out of scope for v1

## Clarifications

### Session 2026-05-31

- Q: Which fields for Car model? → A: Option A - Use all dataset columns as model fields (car_name, brand, model, vehicle_age, km_driven, seller_type, fuel_type, transmission_type, mileage, engine, max_power, seats, selling_price).
