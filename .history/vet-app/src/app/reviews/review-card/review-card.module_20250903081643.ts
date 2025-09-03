
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCard } from './review-card';




@NgModule({
  declarations: [ReviewCard],
  imports: [CommonModule],
  exports: [ReviewCard]   // <-- makes it available to parent modules
})
export class ReviewCardModule {}
