import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container mt-5">
    <h2>Login / Register</h2>
    <form (ngSubmit)="onLogin()">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input class="form-control" [(ngModel)]="email" name="email" />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" [(ngModel)]="password" name="password" />
      </div>
      <button class="btn btn-primary me-2" (click)="onLogin()" type="button">Login</button>
      <button class="btn btn-secondary" (click)="onRegister()" type="button">Register</button>
    </form>
    <div *ngIf="error" class="alert alert-danger mt-3">{{error}}</div>
  </div>
  `
})
export class LoginComponent {
  email = ''
  password = ''
  error: string | null = null

  constructor(private auth: AuthService, private router: Router) {}

  async onLogin() {
    this.error = null
    try {
      const res = await this.auth.login(this.email, this.password)
      this.auth.saveToken(res.token)
      // navigate to home (not implemented)
      this.router.navigateByUrl('/dashboard')
    } catch (err: any) {
      this.error = err.message || String(err)
    }
  }

  async onRegister() {
    this.error = null
    try {
      const res = await this.auth.register(this.email, this.password)
      this.auth.saveToken(res.token)
      this.router.navigateByUrl('/dashboard')
    } catch (err: any) {
      this.error = err.message || String(err)
    }
  }
}
