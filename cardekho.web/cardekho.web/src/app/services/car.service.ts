import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CarModel {
  _id?: string;
  car_name: string;
  brand: string;
  model: string;
  vehicle_age: number;
  km_driven: number;
  seller_type: string;
  fuel_type: string;
  transmission_type: string;
  mileage: number;
  engine: number;
  max_power: number;
  seats: number;
  selling_price: number;
  llm_reasoning?: string;
}

export interface FormMetadata {
  fuelTypes: string[];
  transmissionTypes: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private baseUrl = `${environment.baseUrl}/api/v1/cars`;

  constructor(private httpService: HttpService, private authService: AuthService) {}

  getRandomCars(): Observable<CarModel[]> {
    const token = this.authService.getToken() || undefined;
    return this.httpService.get<CarModel[]>(`${this.baseUrl}/random`, token);
  }

  getFormMetadata(): Observable<FormMetadata> {
    const token = this.authService.getToken() || undefined;
    return this.httpService.get<FormMetadata>(`${this.baseUrl}/metadata`, token);
  }

  filterCars(preferences: any): Observable<CarModel[]> {
    const token = this.authService.getToken() || undefined;
    return this.httpService.post<CarModel[]>(`${this.baseUrl}/filter`, preferences, token);
  }
}
