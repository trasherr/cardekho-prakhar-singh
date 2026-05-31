import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CarService, CarModel, FormMetadata } from '../services/car.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  cars: CarModel[] = [];
  selectedCar: CarModel | null = null;
  loading: boolean = true;
  error: string | null = null;
  metadata: FormMetadata | null = null;

  // Form state for preferences
  preferences = {
    budget: '',
    purpose: '',
    fuel: '',
    transmission: '',
    experience: ''
  };

  constructor(
    private carService: CarService, 
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.carService.getFormMetadata().subscribe({
      next: (data) => {
        this.metadata = data;
      },
      error: (err) => console.error('Failed to fetch metadata', err)
    });

    this.carService.getRandomCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cars. You may need to login again.';
        this.loading = false;
        console.error(err);
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  openModal(content: any, car: CarModel) {
    this.selectedCar = car;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openPreferencesModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'preferences-modal-title', size: 'lg' }).result.then(
      (result) => {
        if (result === 'submit') {
          this.findPerfectCar();
        }
      },
      (reason) => {
        // Modal dismissed
      }
    );
  }

  findPerfectCar() {
    this.loading = true;
    this.error = null;
    this.carService.filterCars(this.preferences).subscribe({
      next: (data) => {
        this.cars = data;
        this.loading = false;
        if (data.length === 0) {
          this.error = 'No cars found matching your criteria. Try loosening your preferences.';
        }
      },
      error: (err) => {
        this.error = 'Failed to fetch filtered cars.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
