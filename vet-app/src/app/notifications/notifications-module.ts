import { TimeagoModule } from 'ngx-timeago';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationList } from './notification-list/notification-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    NotificationList
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
     TimeagoModule.forRoot(),
  ]
})
export class NotificationsModule { }
