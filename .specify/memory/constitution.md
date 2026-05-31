# Cardekho Constitution

## Core Principles

### I. Clean Code & Readability (NON-NEGOTIABLE)

All code MUST be written for humans first, machines second. Maintainability is paramount:
- Variable and function names MUST be descriptive and self-documenting
- Functions MUST be focused (single responsibility principle)
- Maximum line length: 100 characters to ensure readability on standard displays
- Avoid nested callbacks; use async/await or functional composition
- Dead code MUST be removed immediately; never commit commented-out code
- Use clear, consistent formatting (configured via linters/prettier across all projects)

**Rationale**: Readable code reduces cognitive load, decreases bug introduction, and accelerates onboarding and feature development.

### II. Comprehensive JSDoc Documentation (NON-NEGOTIABLE)

Every exported function, class, method, and module MUST include JSDoc comments:
- **Functions**: Include `@param`, `@returns`, `@throws`, and `@example` where applicable
- **Classes**: Describe purpose, constructor params, and key methods
- **Modules**: Include description at top of file explaining module purpose
- **Complex logic**: Add inline comments explaining *why*, not *what* (code shows what)
- JSDoc comments MUST precede their targets and be kept current with code changes

**Rationale**: Comprehensive documentation enables developers to understand intent without reading implementation, accelerates API discovery, and prevents misuse.

### III. Architecture-First Folder Structure

Backend (cardekho.api) MUST follow MVC layering; Frontend (cardekho.web) MUST use modular standalone components:

**Backend Structure**:
```
src/
├── models/        (data schemas: user.model.ts, car.model.ts, etc.)
├── controllers/   (business logic: user.controller.ts, auth.controller.ts, etc.)
├── routers/       (route definitions: user.router.ts, auth.router.ts, etc.)
└── utils/         (helpers: encrypt.utils.ts, validate.utils.ts, ./interfaces/user.interface.ts, etc.)
```

**Frontend Structure**:
```
src/app/
├── shared/        (common base HTTP service, interceptors, guards)
├── features/      (feature modules with lazy-loaded standalone components)
└── core/          (singleton services, app config)
```

**Rationale**: Explicit folder hierarchy enables rapid feature location, consistent team workflow, and predictable code organization.

### IV. Lean Components & Services (Backend & Frontend)

Both solutions MUST maintain separation of concerns:
- **Backend**: Controllers handle HTTP layer only; models handle data; utils handle reusable logic
- **Frontend**: Components MUST be lean (presentation only); business logic MUST live in services; shared HTTP client service MUST be single source of truth for backend communication
- No logic sprawl; if a component exceeds 200 lines (excluding tests/templates), logic should be extracted to a service
- Angular components use standalone pattern; lazy load feature modules where feature is not critical path

**Rationale**: Lean code is testable, reusable, and maintainable. Separation of concerns enables parallel development and reduces coupling.

## Architecture Constraints

### Backend (cardekho.api) - Bun/Hono Stack
- Routes MUST be defined in `routers/` and imported into main app
- Models MUST use Mongoose schema definitions (located in `models/`)
- Controllers MUST not directly modify models; use repository/query layer if needed
- HTTP response codes MUST be semantically correct (200, 201, 400, 401, 403, 404, 500, etc.)
- Error handling MUST use consistent error response format with descriptive messages
- All async operations MUST be properly error-handled (no unhandled promise rejections)

### Frontend (cardekho.web) - Angular Stack
- ALL components MUST be standalone; no NgModule-based architecture
- Use lazy loading for feature routes; avoid loading all features upfront
- Shared services MUST be provided in root or lazy-loaded appropriately
- HTTP interceptors and guards belong in `shared/` service layer
- Components MUST NOT call backend directly; ALL HTTP calls go through injected services
- Use RxJS operators sparingly; prefer async pipe in templates where possible
- CSS/SCSS MUST be scoped to components (component-level stylesheets, not global)

## Quality Standards & Code Review

### Review Requirements
- All code changes MUST have JSDoc added/updated
- All exported functions/classes MUST have documentation
- Code MUST pass linter rules (ESLint for backend/frontend)
- Code MUST be formatted with Prettier before commit

### Deployment & Versioning
- Breaking changes in API endpoints MUST be versioned (e.g., `/api/v1/users`)
- Frontend builds MUST not exceed 1MB gzipped (excluding vendor libraries)
- Both solutions MUST document environment variables needed for deployment
- Releases MUST follow semantic versioning (MAJOR.MINOR.PATCH)

## Governance

This constitution is the source of truth for development practices in Cardekho. All team members MUST follow these principles in PRs, code reviews, and architecture decisions.

**Version**: 1.0.0 | **Ratified**: 2026-05-31 | **Last Amended**: 2026-05-31
