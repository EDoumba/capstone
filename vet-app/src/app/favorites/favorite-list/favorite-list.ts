import { Component, OnInit } from '@angular/core';

interface Vet {
  id: number;
  name: string;
  imageUrl?: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: number;
  address: string;
}

@Component({
  selector: 'app-favorite-list',
  standalone: false,
  templateUrl: './favorite-list.html',
  styleUrls: ['./favorite-list.scss']
})
export class FavoriteList implements OnInit {
  loading: boolean = true;
  favorites: Vet[] = [];

  ngOnInit() {
    // Simulate loading favorites (replace with actual API call)
    setTimeout(() => {
      this.favorites = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          imageUrl: 'assets/vets/sarah.jpg',
          specialty: 'Small Animals',
          rating: 4,
          reviewCount: 12,
          experience: 8,
          address: '123 Main St, Calgary'
        },
        {
          id: 2,
          name: 'Dr. Michael Lee',
          specialty: 'Exotic Animals',
          rating: 5,
          reviewCount: 20,
          experience: 10,
          address: '456 Elm St, Calgary'
        }
      ];
      this.loading = false;
    }, 1500);
  }

  removeFavorite(vetId: number) {
    this.favorites = this.favorites.filter(vet => vet.id !== vetId);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
