<!-- SPECKIT START -->
**Current Feature**: User Authentication (Login & Register) — `001-basic-login`

**Implementation Plan**: [specs/001-basic-login/plan.md](../specs/001-basic-login/plan.md)

**Implementation Tasks**: [specs/001-basic-login/tasks.md](../specs/001-basic-login/tasks.md) — 55 tasks organized by user story (registration, login, routing) in 6 phases

**Key Decisions**:
- Backend: Bun/Hono with JWT authentication, bcryptjs password hashing, MongoDB persistence
- Frontend: Angular standalone component, localStorage token storage, HTTP interceptor
- Database: MongoDB with unique email index per `.env.local` connection string
- API: REST endpoints at `/api/v1/auth/register` and `/api/v1/auth/login`

**Architecture**: Follows Cardekho Constitution v1.0.0 (MVC backend, lean components, comprehensive JSDoc, 80% test coverage)

For implementation details, design artifacts, and technical decisions, see the plan and tasks files above.
<!-- SPECKIT END -->
