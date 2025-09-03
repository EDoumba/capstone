import { Component, OnInit } from '@angular/core';
import { Vet } from './../../core/services/vet';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-vet-detail',
  standalone: false,
  templateUrl: './vet-detail.html',
  styleUrls: ['./vet-detail.scss']
})
export class VetDetail implements OnInit {

  vet: Vet | null = null;          // Holds veterinarian data
  reviews: any[] = [];             // Holds reviews data
  loading: boolean = true;          // For loading spinner
  isFavorite: boolean = false;      // Tracks if vet is saved/favorited

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadVetDetails();
  }

  loadVetDetails() {
    // TODO: Replace with real service call
    // Simulating loading data
    setTimeout(() => {
      this.vet = {
        id: 1,
        name: 'John Doe',
        specialty: 'Veterinary Medicine',
        rating: 4,
        reviewCount: 12,
        experience: 8,
        phone: '123-456-7890',
        email: 'johndoe@example.com',
        address: '123 Main Street, Calgary, AB',
        imageUrl: '',
        availability: [
          { day: 'Monday', times: ['9:00 AM - 12:00 PM', '1:00 PM - 5:00 PM'] },
          { day: 'Tuesday', times: ['10:00 AM - 2:00 PM'] },
        ]
      };
      this.reviews = [];
      this.loading = false;
    }, 1000);
  }

  get vetImage(): string {
  return this.vet?.imageUrl || 'assets/default-vet.jpg';
}

  getStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, index) => index + 1);
  }

  getEmptyStars(rating: number): number[] {
    return Array.from({ length: 5 - rating }, (_, index) => index + 1);
  }

  openAppointmentDialog(): void {
    // TODO: Implement appointment dialog
    console.log('Open appointment dialog');
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  openReviewDialog(): void {
    // TODO: Implement review dialog
    console.log('Open review dialog');
  }
}
