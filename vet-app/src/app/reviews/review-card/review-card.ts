import { Component, Input } from '@angular/core';
import { Review } from '../../core/services/review';


@Component({
  selector: 'app-review-card',
  standalone: false,
  templateUrl: './review-card.html',
  styleUrls: ['./review-card.scss'],
  
})
export class ReviewCard {
  @Input() review!: Review;

  someDate = new Date();

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
