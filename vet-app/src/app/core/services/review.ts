import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  vetId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CreateReviewData {
  vetId: number;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }

  getVetReviews(vetId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`/api/reviews/vet/${vetId}`);
  }

  getUserReviews(): Observable<Review[]> {
    return this.http.get<Review[]>('/api/reviews/user');
  }

  createReview(reviewData: CreateReviewData): Observable<Review> {
    return this.http.post<Review>('/api/reviews', reviewData);
  }

  updateReview(id: number, updates: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`/api/reviews/${id}`, updates);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`/api/reviews/${id}`);
  }
}