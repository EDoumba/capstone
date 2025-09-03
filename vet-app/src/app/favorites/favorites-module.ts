import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteList } from './favorite-list/favorite-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { RouterModule } from '@angular/router';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';




@NgModule({
  declarations: [
    FavoriteList
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCard,
    RouterModule,
    MatCardModule,
    MatButtonModule

  ]
})
export class FavoritesModule { }
