import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Vet {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  address: string;
  rating: number;
  imageUrl?: string;
  reviewCount: number;
}

interface Pet {
  id: number;
  name: string;
  type: string; // Added type property
}

@Component({
  selector: 'app-appointment-form',
  standalone: false,
  templateUrl: './appointment-form.html',
})
export class AppointmentForm implements OnInit {
  appointmentForm!: FormGroup;
  vets: Vet[] = [];
  pets: Pet[] = [];
  availableTimes: string[] = [];
  loading = false;
  selectedVet?: Vet;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize reactive form
    this.appointmentForm = this.fb.group({
      vetId: [null, Validators.required],
      petId: [null, Validators.required],
      date: [null, Validators.required],
      time: [null, Validators.required],
      reason: ['', Validators.required],
    });

    // Example vets data
    this.vets = [
      { id: 1, name: 'Dr. Smith', specialty: 'Surgery', experience: 10, address: '123 Main St', rating: 4, imageUrl: '', reviewCount: 20 },
      { id: 2, name: 'Dr. Lee', specialty: 'Dermatology', experience: 7, address: '456 Oak St', rating: 5, imageUrl: '', reviewCount: 15 },
    ];

    // Example pets data with type
    this.pets = [
      { id: 1, name: 'Buddy', type: 'Dog' },
      { id: 2, name: 'Mittens', type: 'Cat' },
    ];
  }

  // Submit handler
  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.loading = true;
      console.log('Form submitted:', this.appointmentForm.value);
      // Simulate API call
      setTimeout(() => this.loading = false, 1000);
    }
  }

  // Handle vet selection
  onVetSelect(vetId: number): void {
    this.selectedVet = this.vets.find(v => v.id === vetId);
    // Example: populate available times
    this.availableTimes = ['09:00 AM', '10:00 AM', '02:00 PM'];
  }

  // Helper: get full stars
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Helper: get empty stars
  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
