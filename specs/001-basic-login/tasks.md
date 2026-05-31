# Tasks: User Authentication (Login & Register)

**Input**: Design documents from `/specs/001-basic-login/`

**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included (unit tests for services, components, and API endpoints); minimum 80% coverage required per Cardekho Constitution

**Organization**: Tasks grouped by user story (US1, US2, US3) enabling independent implementation and testing

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3)
- Task descriptions include exact file paths for precision

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: Foundational (blocking prerequisites for all user stories)
    ├→ Phase 3: US1 (Registration)
    ├→ Phase 4: US2 (Login)
    └→ Phase 5: US3 (Default Landing Page)
    ↓
Phase 6: Polish & Cross-Cutting
```

**Parallel Opportunities**:
- T009-T011 (backend models, controllers, services) can run in parallel
- T020-T022 (frontend auth service, guard, component) can run in parallel
- US1 (registration) and US2 (login) can be developed in parallel after foundational phase

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install backend dependencies: Hono, Mongoose, bcryptjs, jsonwebtoken in `cardekho.api/package.json`
- [ ] T002 Install frontend dependencies: Angular, ng-bootstrap already added; verify compatible versions in `cardekho.web/package.json`
- [ ] T003 [P] Configure MongoDB connection via `.env.local` (MONGODB_URI, JWT_SECRET, JWT_EXPIRY variables)
- [ ] T004 [P] Initialize TypeScript configuration for backend (`cardekho.api/tsconfig.json`; verify strict mode enabled)
- [ ] T005 [P] Configure ESLint and Prettier for code formatting in both backend and frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase completes

- [ ] T006 Create base HTTP error response utility in `cardekho.api/src/utils/response.utils.ts` (success, error response formatters)
- [ ] T007 Create email validation utility in `cardekho.api/src/utils/validate.utils.ts` (RFC 5322 regex, password length checks)
- [ ] T008 Create password encryption utility in `cardekho.api/src/utils/encrypt.utils.ts` (bcryptjs hash, verify functions with JSDoc)
- [ ] T009 [P] Create User model interfaces in `cardekho.api/src/utils/interfaces/user.interface.ts` (IUser, IUserDocument)
- [ ] T010 [P] Create Auth request/response interfaces in `cardekho.api/src/utils/interfaces/auth.interface.ts` (IRegisterReq, ILoginReq, IAuthResponse)
- [ ] T011 [P] Create HTTP base service in `cardekho.web/cardekho.web/src/app/shared/services/http.service.ts` (HttpClient wrapper, interceptor for Authorization header)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯

**Goal**: Users can create accounts with email + password; registration validates inputs, hashes password, prevents duplicates, and returns JWT token

**Independent Test**: Register page with form, submit valid/invalid data, verify account creation, error handling — no login dependency

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create Mongoose User model in `cardekho.api/src/models/user.model.ts` (email unique index, passwordHash field, timestamps)
- [ ] T013 [P] [US1] Create Auth service `register()` function in `cardekho.api/src/services/auth.service.ts` (validate, hash, create user, generate JWT, return token)
- [ ] T014 [US1] Create Auth controller `registerHandler()` in `cardekho.api/src/controllers/auth.controller.ts` (HTTP 201 on success, 400/409 on error, call auth.service.register)
- [ ] T015 [US1] Create Auth router with POST `/api/v1/auth/register` endpoint in `cardekho.api/src/routers/auth.router.ts` (import controller handler)
- [ ] T016 [US1] Mount Auth router to main app in `cardekho.api/src/index.ts` (app.route('/api/v1/auth', authRouter))
- [ ] T017 [P] [US1] Create registration form validation (email format, password length) in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.ts` (client-side checks)
- [ ] T018 [P] [US1] Create Auth service in `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` with `register()` method (call backend API via http.service, handle response/errors)
- [ ] T019 [US1] Create register/login template in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.html` (email input, password input, submit button, toggle mode button, error display)
- [ ] T020 [US1] Create register/login component styles in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.scss` (scoped, responsive form layout)
- [ ] T021 [US1] Create standalone register/login component in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.ts` (<100 lines: form handling, mode toggle, calls auth.service.register, error display, JSDoc)
- [ ] T022 [US1] Write unit tests for registration in `cardekho.api/src/services/auth.service.spec.ts` (valid registration, duplicate email, invalid email, short password, 80% coverage)
- [ ] T023 [US1] Write component tests for registration form in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.spec.ts` (form validation, error display, submit handler)

**Checkpoint**: User Story 1 fully functional and independently testable ✅

---

## Phase 4: User Story 2 - User Login (Priority: P1)

**Goal**: Registered users authenticate with email + password; login validates credentials, compares password hash, generates JWT, persists token

**Independent Test**: Login page accepts email/password, verifies valid/invalid credentials, stores token, error handling — register not required

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create Auth service `login()` function in `cardekho.api/src/services/auth.service.ts` (find user, verify password with bcryptjs, generate JWT, return token)
- [ ] T025 [P] [US2] Create Auth controller `loginHandler()` in `cardekho.api/src/controllers/auth.controller.ts` (HTTP 200 on success, 401/400 on error, call auth.service.login)
- [ ] T026 [US2] Add POST `/api/v1/auth/login` endpoint to Auth router in `cardekho.api/src/routers/auth.router.ts` (import controller handler)
- [ ] T027 [US2] Extend Auth service in `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` with `login()` method (call backend API, save token to localStorage)
- [ ] T028 [US2] Add `saveToken()` method to Auth service in `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` (store JWT in localStorage, update user state)
- [ ] T029 [US2] Add login form handling to register-login component `submit()` method in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.ts` (toggle between register/login, call appropriate service method)
- [ ] T030 [US2] Add `getToken()`, `isAuthenticated()`, `logout()` methods to Auth service in `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` (retrieve token, check if logged in, clear token)
- [ ] T031 [US2] Write unit tests for login in `cardekho.api/src/services/auth.service.spec.ts` (valid login, invalid email, wrong password, token generation, 80% coverage)
- [ ] T032 [US2] Write component tests for login form in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.spec.ts` (form submission, error display for invalid credentials)

**Checkpoint**: User Story 2 fully functional and independently testable; users can now register AND login ✅

---

## Phase 5: User Story 3 - Default Landing Page (Priority: P1)

**Goal**: Login/register page is default for unauthenticated users; authenticated users redirected away; protected routes guarded

**Independent Test**: Access root URL, verify correct page displayed based on auth state; protected routes test guard behavior

### Implementation for User Story 3

- [ ] T033 [P] [US3] Create Auth Guard in `cardekho.web/cardekho.web/src/app/shared/guards/auth.guard.ts` (implements CanActivate, redirects to login if not authenticated)
- [ ] T034 [P] [US3] Create app routes in `cardekho.web/cardekho.web/src/app/app.routes.ts` (define /login, /dashboard routes with guards, lazy loading where appropriate)
- [ ] T035 [US3] Create root redirect logic in `cardekho.web/cardekho.web/src/app/app.ts` (check isAuthenticated, navigate to /login or /dashboard accordingly)
- [ ] T036 [US3] Create HTTP interceptor in `cardekho.web/cardekho.web/src/app/shared/services/http.service.ts` (auto-add Authorization header with JWT token to all requests)
- [ ] T037 [US3] Add `checkToken()` method to Auth service in `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` (on app init, check localStorage for token and validate)
- [ ] T038 [US3] Create middleware for JWT verification in `cardekho.api/src/middleware/auth.middleware.ts` (verify token, attach user to request context, return 401 if invalid)
- [ ] T039 [US3] Create dashboard component stub in `cardekho.web/cardekho.web/src/app/dashboard.component.ts` (protected route destination, shows "User logged in" message, logout button)
- [ ] T040 [US3] Write unit tests for Auth Guard in `cardekho.web/cardekho.web/src/app/shared/guards/auth.guard.spec.ts` (authenticated: allow access, not authenticated: redirect to login)
- [ ] T041 [US3] Write integration tests for routing in `cardekho.web/cardekho.web/src/app/app.routes.spec.ts` (unauthenticated access redirects to /login, authenticated users can access /dashboard)

**Checkpoint**: All three user stories complete; users can register, login, and navigate protected routes ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Testing, documentation, error handling refinement, code review readiness

- [ ] T042 [P] Add JSDoc comments to all exported functions in backend utilities (`encrypt.utils.ts`, `validate.utils.ts`, `response.utils.ts`)
- [ ] T043 [P] Add JSDoc comments to User model and Auth service in `cardekho.api/src/models/user.model.ts`, `services/auth.service.ts`
- [ ] T044 [P] Add JSDoc comments to Auth controller in `cardekho.api/src/controllers/auth.controller.ts` (document request/response, error codes)
- [ ] T045 [P] Add JSDoc comments to Auth service in frontend `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` (document methods, parameters, return types)
- [ ] T046 Add error logging to backend services in `cardekho.api/src/services/auth.service.ts` (log validation errors, auth failures for debugging)
- [ ] T047 Add error user messages mapping in `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.ts` (translate backend error codes to user-friendly messages)
- [ ] T048 [P] Verify backend test coverage ≥80% for `auth.service.ts`, `encrypt.utils.ts`, `validate.utils.ts`
- [ ] T049 [P] Verify frontend test coverage ≥80% for `auth.service.ts`, `register-login.component.ts`
- [ ] T050 Run ESLint and Prettier across backend and frontend code (verify no linting errors, format all files)
- [ ] T051 Verify Cardekho Constitution compliance (clean code, JSDoc, MVC structure, lean components, test coverage in PR review)
- [ ] T052 [P] Manual smoke test: Register new user → Login → Access dashboard → Logout → Redirected to login
- [ ] T053 [P] Manual edge case test: Duplicate email registration, invalid email, short password, wrong password, concurrent logins
- [ ] T054 Update API documentation in `specs/001-basic-login/contracts/` with final implementation details if any changes made
- [ ] T055 Add environment variable documentation in `cardekho.api/.env.local` with example values and comments

---

## MVP Scope Recommendation

✅ **Recommended MVP**: All tasks T001-T055 (complete basic login feature)

**Why full scope**:
- All three user stories (P1) are independent and can be developed in parallel
- Foundation phase (T001-T011) blocking but minimal
- Polish phase ensures code quality per constitution
- Total estimated effort: ~40-60 developer hours

**Suggested Timeline**:
- **Phase 1**: 2-3 hours (setup)
- **Phase 2**: 4-6 hours (foundation)
- **Phase 3**: 10-14 hours (registration)
- **Phase 4**: 8-12 hours (login)
- **Phase 5**: 8-12 hours (routing & guards)
- **Phase 6**: 6-10 hours (polish & testing)

---

## Parallel Execution Examples

### Backend Development (Parallel After Phase 2)

```
Thread 1: T012-T016 (User Registration backend)
Thread 2: T024-T026 (User Login backend)
Both: T022, T031 (Tests)
```

### Frontend Development (Parallel After Phase 2)

```
Thread 1: T017-T021 (Register/login component)
Thread 2: T027-T030 (Auth service methods)
Thread 3: T033-T039 (Routing & guards)
All: T023, T032, T040-T041 (Tests)
```

### Independent Components (Can Start Immediately After Phase 1)

- Backend: All backend work parallelizable after phase 1
- Frontend: All frontend work parallelizable after phase 1
- Tests: Can be written alongside or before implementation per TDD

---

## Task Completion Criteria

Each task is complete when:
1. ✅ Code written per Cardekho Constitution (clean, <100 char lines, meaningful names)
2. ✅ JSDoc comments added to all exported functions/classes
3. ✅ Unit/component tests written (if applicable) with ≥80% coverage for new code
4. ✅ All tests passing locally (`npm test`)
5. ✅ ESLint & Prettier validation passing (`npm run lint`, `npm run format`)
6. ✅ Ready for pull request review

---

## Implementation Notes

### Backend Focus Areas

1. **User Model** (T012): Mongoose schema with unique email index, createdAt timestamp
2. **Services** (T013, T024): Business logic isolated from controllers; pure functions where possible
3. **Controllers** (T014, T025): Thin HTTP layer; delegate to services; consistent error handling
4. **Utilities** (T007, T008): Reusable, well-tested, documented with JSDoc
5. **Middleware** (T038): JWT verification, error handling for protected routes
6. **Testing**: Mock Mongoose in tests; use Jest/Vitest for backend unit tests

### Frontend Focus Areas

1. **Auth Service** (T027-T030): Centralized auth logic; localStorage token management
2. **Component** (T021): Single responsibility: form handling; <100 lines; JSDoc
3. **HTTP Interceptor** (T036): Auto-inject Authorization header; handle 401 responses
4. **Guards** (T033): CanActivate implementation; redirect logic
5. **Routes** (T034): Lazy loading where appropriate; explicit path definitions
6. **Testing**: Mock HttpClient; test component form logic, service API calls

### Security Considerations

1. Passwords ALWAYS hashed (bcryptjs, never plaintext) — T008
2. Email case-insensitive (stored lowercase) — T013
3. Unique index on email prevents duplicates — T012
4. JWT token TTL 24 hours — T013, T024
5. HTTP interceptor auto-injects token on all requests — T036
6. 401 Unauthorized on invalid/expired token — T038

---

## File Checklist (for reference)

### Backend Files

- [ ] `cardekho.api/src/models/user.model.ts` ← T012
- [ ] `cardekho.api/src/controllers/auth.controller.ts` ← T014, T025
- [ ] `cardekho.api/src/services/auth.service.ts` ← T013, T024
- [ ] `cardekho.api/src/routers/auth.router.ts` ← T015, T026
- [ ] `cardekho.api/src/middleware/auth.middleware.ts` ← T038
- [ ] `cardekho.api/src/utils/encrypt.utils.ts` ← T008
- [ ] `cardekho.api/src/utils/validate.utils.ts` ← T007
- [ ] `cardekho.api/src/utils/response.utils.ts` ← T006
- [ ] `cardekho.api/src/utils/interfaces/user.interface.ts` ← T009
- [ ] `cardekho.api/src/utils/interfaces/auth.interface.ts` ← T010
- [ ] `cardekho.api/src/services/auth.service.spec.ts` ← T022, T031
- [ ] `cardekho.api/.env.local` ← T003

### Frontend Files

- [ ] `cardekho.web/cardekho.web/src/app/auth/services/auth.service.ts` ← T018, T027-T030
- [ ] `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.ts` ← T021
- [ ] `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.html` ← T019
- [ ] `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.scss` ← T020
- [ ] `cardekho.web/cardekho.web/src/app/auth/components/register-login.component.spec.ts` ← T023, T032
- [ ] `cardekho.web/cardekho.web/src/app/shared/services/http.service.ts` ← T011, T036
- [ ] `cardekho.web/cardekho.web/src/app/shared/guards/auth.guard.ts` ← T033
- [ ] `cardekho.web/cardekho.web/src/app/shared/guards/auth.guard.spec.ts` ← T040
- [ ] `cardekho.web/cardekho.web/src/app/dashboard.component.ts` ← T039
- [ ] `cardekho.web/cardekho.web/src/app/app.routes.ts` ← T034
- [ ] `cardekho.web/cardekho.web/src/app/app.routes.spec.ts` ← T041
- [ ] `cardekho.web/cardekho.web/src/app/app.ts` ← T035

---

**Tasks Ready for Implementation** ✅

**Version**: 1.0.0 | **Created**: 2026-05-31 | **Branch**: `001-basic-login`
