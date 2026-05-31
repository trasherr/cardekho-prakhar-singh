import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { firstValueFrom } from 'rxjs';

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  base = `${environment.baseUrl}/api/v1/auth`

  constructor(private httpService: HttpService) {}

  async register(email: string, password: string): Promise<AuthResponse> {
    return firstValueFrom(
      this.httpService.post<AuthResponse>(`${this.base}/register`, { email, password })
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return firstValueFrom(
      this.httpService.post<AuthResponse>(`${this.base}/login`, { email, password })
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token)
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  logout() {
    localStorage.removeItem('token')
  }
}
