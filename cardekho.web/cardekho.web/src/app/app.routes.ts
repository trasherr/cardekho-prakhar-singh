import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'dashboard', component: Dashboard }
];
