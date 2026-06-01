# CarDekho

A full-stack web application that helps confused car buyers go from "I don't know what to buy" to "I'm confident about my shortlist."

## What We Built & Why

### The Problem
Car buyers face decision paralysis: thousands of options, conflicting specs, unclear which car fits their needs. Price alone doesn't answer "Is this the right car for *me*?"

### The Solution
**CarDekho** is an opinionated questionnaire + AI recommendation engine that:
1. **Understands intent**: Budget, usage (city/family/highway/thrill), fuel preference, experience level
2. **Filters intelligently**: Server-side filtering eliminates 99% of irrelevant cars
3. **Explains choices**: Uses Claude LLM to generate personalized reasoning for why each car matches the buyer
4. **Enables comparison**: Side-by-side car comparison to build confident shortlists
5. **Saves progress**: Buyers can favorite cars and build a personal shortlist

### Product Decisions (Intentionally Cut)
- ❌ User reviews/ratings — adds moderation burden, not core to decision-making
- ❌ Finance calculators — out of scope, banks do this better
- ❌ Trade-in valuation — requires external API, scope creep
- ❌ Dealer inventory — focuses on education, not transactions (yet)
- ❌ Advanced analytics — pie charts, trend reports — nice-to-have, not MVP
- ✅ **Auth system** — required for saved shortlists and future personalization
- ✅ **LLM reasoning** — core differentiator vs. generic filter UIs

## Tech Stack & Why

### Backend: **Bun + Hono + MongoDB**
- **Bun**: Fast runtime, minimal setup, great for rapid prototyping
- **Hono**: Lightweight router, perfect for REST APIs, TypeScript-native
- **MongoDB + Mongoose**: Flexible schema (car specs vary), native JavaScript, quick iteration
- **LangChain + Google Gemini**: Production-grade LLM integration, fallback handling

**Why this over others?**
- Node.js + Express would be heavier; Next.js would blur backend/frontend
- .NetCore would require context switching and more development time
- Bun gives us single-language stack without sacrificing performance

### Frontend: **Angular 20 + Bootstrap**
- **Angular**: Standalone components (modern), dependency injection (testable), strong typing
- **Bootstrap 5 + ng-bootstrap**: Rapid UI prototyping, responsive out-of-box, no custom CSS debt
- **RxJS**: Reactive state management without Redux complexity (small app scope)

**Why this over React/Vue?**
- Angular's TypeScript first-class support catches bugs early
- Standalone components eliminated module boilerplate
- Pre-configured (ng new) = instant productivity
- Smaller bundle footprint than React for form-heavy apps

### Database: **MongoDB**
- Schema-less benefits: Car specs are heterogeneous (some have sunroof, some don't)
- Native arrays/objects: Storing user favorites and car features is natural
- **Critical**: Unique index on `email` field for authentication
- Connection via `.env.local` (not committed)

## What We Delegated to AI vs. Manual Work

### ✅ AI Did Well
1. **Scaffolding** — generated initial project structure, Docker setup
2. **Auth boilerplate** — JWT token generation, bcrypt integration, middleware
3. **Route/controller skeleton** — RESTful pattern generation
4. **Component templates** — Modal layouts, form generation in Angular
5. **LLM integration** — LangChain setup, prompt engineering for car reasoning
6. **Styling** — Bootstrap utility classes, responsive grid layouts

### Where Tools Helped Most
- **Code generation**: 90% less typing, fewer typos in verbose Angular decorators
- **Debugging**: "Why is my MongoDB query not matching?" → AI suggested aggregation pipeline
- **Prompt refinement**: "Why is the LLM reasoning generic?" → AI helped restructure system prompt
- **CSS/HTML**: Zero custom CSS needed; Bootstrap saved 2+ hours of styling

## Features Implemented 

### Phase 1: Auth Foundation
- [x] User registration (email + password, 8+ char validation)
- [x] Secure login (bcryptjs hashing, JWT tokens)
- [x] Token persistence (localStorage)
- [x] Protected routes (HTTP interceptor, redirect on 401)

### Phase 2: Core Discovery Flow
- [x] 5-question questionnaire (budget, purpose, fuel, transmission, experience)
- [x] Random car feed (6 cars on load)
- [x] AI-powered filtering (Claude reasons about each car match)
- [x] Live LLM reasoning display (shows "Why it's perfect for you")

### Phase 3: Enhanced UX
- [x] Car detail modal (full specs, badges for fuel/transmission/km)
- [x] Filter metadata API (distinct fuel types, transmissions)
- [x] Error handling (no results → guide user to loosen filters)
- [x] Loading states (spinners during async calls)

### Phase 4: Shortlist & Comparison
- [x] Compare 2-4 cars side-by-side (detailed specs + LLM reasoning)
- [x] Search by car name/brand (real-time filtering)

## If We Had 4 More Hours

### Highest Priority (Would Add)
1. **Analytics Dashboard** (1 hr) — Track: which preferences filter most, which cars appear in shortlists most (→ inventory insights)
2. **Reviews & Ratings** (1.5 hrs) — Users rate cars they bought; feeds into ranking (but requires moderation workflow — deprioritized)
3. **Email Notifications** (1 hr) — Notify users when new car added matching their saved preferences
4. **Export Shortlist** (0.5 hr) — PDF/CSV of saved cars for dealer visits or sharing

### Nice-to-Have (Would Consider)
- Dark mode toggle
- Mobile app (React Native wrapper)
- Price trend chart (30-day history)
- Dealer locator (Google Maps integration)
- Wishlist sharing (generate link for friends)

### Would NOT Build (Out of Scope)
- Finance calculator (complex, requires partner APIs)
- Trade-in valuation (requires complex ML model)
- Dealer inventory sync (requires dealer partnerships)
- Multi-language support (nice but doesn't help MVP)

## Lessons Learned

### What Worked
1. **Questionnaire-first approach** — Turned "too many options" into focused search immediately
2. **AI reasoning display** — Users trust recommendations more when they see *why*
3. **Favorites + comparison** — Two-step flow (find → compare → save) is intuitive
4. **Bun's speed** — Real-time hot reload made iteration fast

### What Didn't
1. **Over-engineering auth initially** — Role-based access, permissions; cut it, nobody needs it
2. **Generic filter UI** — Started with sliders; questionnaire format is faster to answer
3. **Mocking LLM during dev** — When integrated, prompts needed tweaking (wasted time)

## Deployment Status

### Current
- **Docker image**: Ready to deploy 
- **Frontend**: Optimized build output in `dist/`
- **Database**: Works with local MongoDB or Atlas (cloud)
- **API**: Stateless (scales horizontally)
