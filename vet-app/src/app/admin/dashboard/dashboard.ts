import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  recentActivities = [
    {
      icon: 'person',
      title: 'New User',
      description: 'A new user has registered.',
      time: '2 hours ago'
    },
    {
      icon: 'shopping_cart',
      title: 'New Order',
      description: 'An order has been placed.',
      time: '3 hours ago'
    },
    {
      icon: 'attach_money',
      title: 'Payment Received',
      description: 'Payment has been received successfully.',
      time: '5 hours ago'
    },
    {
      icon: 'event',
      title: 'Event Scheduled',
      description: 'A new event has been scheduled.',
      time: '1 day ago'
    },
    {
      icon: 'bar_chart',
      title: 'Monthly Report',
      description: 'Monthly report has been generated.',
      time: '2 days ago'
    }
  ];
}
