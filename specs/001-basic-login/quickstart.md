# Quick Start: User Authentication

**Feature**: Basic Login (001-basic-login)  
**Version**: 1.0.0  
**Date**: 2026-05-31

## Overview

Get up and running with user registration, login, and protected routes in Cardekho.

---

## Prerequisites

- Node.js 18+ with Bun runtime installed
- MongoDB instance (local or Atlas) with connection string in `.env.local`
- Angular CLI (`ng`) installed globally
- Postman or curl for API testing (optional)

---

## Backend Setup (cardekho.api)

### 1. Install Dependencies

```bash
cd cardekho.api
npm install bcryptjs jsonwebtoken dotenv mongoose
```

### 2. Configure Environment Variables

Create or update `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cardekho?retryWrites=true
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRY=24h
PORT=3000
```

### 3. Create User Model

**File**: `src/models/user.model.ts`
```typescript
/**
 * User Mongoose schema for authentication
 * Stores email and hashed password for registered users
 * @module models/user
 */
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../utils/interfaces/user.interface';

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
```

### 4. Create Auth Service

**File**: `src/services/auth.service.ts`
```typescript
/**
 * Authentication service - handles user registration and login
 * @module services/auth
 */
import { User } from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/encrypt.utils';
import { validateEmail, validatePassword } from '../utils/validate.utils';
import { IRegisterReq, ILoginReq, IAuthResponse } from '../utils/interfaces/auth.interface';
import jwt from 'jsonwebtoken';

/**
 * Register a new user
 * @param req - Register request with email and password
 * @returns Auth response with token and user
 * @throws Error if validation fails or email exists
 */
export async function register(req: IRegisterReq): Promise<IAuthResponse> {
  // Validation
  if (!validateEmail(req.email)) throw new Error('Invalid email format');
  if (!validatePassword(req.password)) throw new Error('Password must be at least 8 characters');

  // Check duplicate
  const existing = await User.findOne({ email: req.email.toLowerCase() });
  if (existing) throw new Error('Email already registered');

  // Hash password
  const passwordHash = await hashPassword(req.password);

  // Create user
  const user = await User.create({
    email: req.email.toLowerCase(),
    passwordHash,
  });

  // Generate token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );

  return { token, user: { id: user._id.toString(), email: user.email } };
}

/**
 * Login user
 * @param req - Login request with email and password
 * @returns Auth response with token and user
 * @throws Error if credentials invalid
 */
export async function login(req: ILoginReq): Promise<IAuthResponse> {
  // Validation
  if (!validateEmail(req.email)) throw new Error('Invalid email format');
  if (!req.password) throw new Error('Password required');

  // Find user
  const user = await User.findOne({ email: req.email.toLowerCase() });
  if (!user) throw new Error('Invalid email or password');

  // Verify password
  const valid = await verifyPassword(req.password, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  // Generate token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );

  return { token, user: { id: user._id.toString(), email: user.email } };
}
```

### 5. Create Auth Controller

**File**: `src/controllers/auth.controller.ts`
```typescript
/**
 * Authentication controller - HTTP handlers for auth endpoints
 * @module controllers/auth
 */
import { Context } from 'hono';
import { register, login } from '../services/auth.service';
import { errorResponse, successResponse } from '../utils/response.utils';

/**
 * POST /api/v1/auth/register - Register new user
 */
export async function registerHandler(c: Context) {
  try {
    const body = await c.req.json();
    const result = await register(body);
    return c.json(result, 201);
  } catch (err: any) {
    return errorResponse(c, err.message, 400);
  }
}

/**
 * POST /api/v1/auth/login - Login user
 */
export async function loginHandler(c: Context) {
  try {
    const body = await c.req.json();
    const result = await login(body);
    return c.json(result, 200);
  } catch (err: any) {
    const statusCode = err.message.includes('already') ? 409 : 401;
    return errorResponse(c, err.message, statusCode);
  }
}
```

### 6. Create Auth Router

**File**: `src/routers/auth.router.ts`
```typescript
/**
 * Authentication routes
 * @module routers/auth
 */
import { Hono } from 'hono';
import { registerHandler, loginHandler } from '../controllers/auth.controller';

const router = new Hono();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
```

### 7. Import Router in Main App

**File**: `src/index.ts`
```typescript
import { Hono } from 'hono';
import authRouter from './routers/auth.router';
import mongoose from 'mongoose';

const app = new Hono();

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/cardekho');

// Mount auth router at /api/v1/auth
app.route('/api/v1/auth', authRouter);

export default app;
```

### 8. Test Backend

```bash
# Start server
npm run dev

# Test register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePass123"}'

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePass123"}'
```

---

## Frontend Setup (cardekho.web)

### 1. Create Auth Service

**File**: `src/app/auth/services/auth.service.ts`
```typescript
/**
 * Authentication service - manages user login/register and token storage
 * @module auth/services/auth
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/v1/auth';
  private currentUser = new BehaviorSubject<any>(null);
  public user$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  /**
   * Register new user
   * @param email - User email
   * @param password - User password
   */
  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password });
  }

  /**
   * Login user
   * @param email - User email
   * @param password - User password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  /**
   * Save token to localStorage
   */
  saveToken(response: AuthResponse): void {
    localStorage.setItem('authToken', response.token);
    this.currentUser.next(response.user);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUser.next(null);
  }

  /**
   * Check token on app init
   */
  private checkToken(): void {
    const token = this.getToken();
    if (token) {
      // Optional: Decode JWT to get user info
      // This is a simplified check; in production, validate token with backend
      this.currentUser.next({ email: 'user@example.com' });
    }
  }
}
```

### 2. Create Auth Guard

**File**: `src/app/shared/guards/auth.guard.ts`
```typescript
/**
 * Route guard - redirect to login if not authenticated
 * @module shared/guards/auth
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
```

### 3. Create Login/Register Component

**File**: `src/app/auth/components/register-login.component.ts`
```typescript
/**
 * Login/Register form component - standalone
 * @module auth/components/register-login
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-login.component.html',
  styleUrls: ['./register-login.component.scss'],
})
export class RegisterLoginComponent {
  isLoginMode = true;
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.loading = true;
    const action = this.isLoginMode ? this.auth.login(this.email, this.password) : this.auth.register(this.email, this.password);

    action.subscribe({
      next: (response) => {
        this.auth.saveToken(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error occurred';
        this.loading = false;
      },
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }
}
```

### 4. Create Routes

**File**: `src/app/app.routes.ts`
```typescript
/**
 * App routes configuration
 * @module app.routes
 */
import { Routes } from '@angular/router';
import { RegisterLoginComponent } from './auth/components/register-login.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: RegisterLoginComponent },
  { path: 'register', component: RegisterLoginComponent },
  { path: 'dashboard', canActivate: [AuthGuard], component: () => import('./dashboard.component') },
];
```

### 5. Test Frontend

```bash
cd cardekho.web/cardekho.web
ng serve

# Open http://localhost:4200
# You should see login/register form
# Try registering and logging in
```

---

## Next Steps

✅ Backend API endpoints ready  
✅ Frontend authentication pages ready  

➡️ Run `/speckit.tasks` to generate detailed implementation tasks  
➡️ Run `/speckit.implement` to execute tasks
