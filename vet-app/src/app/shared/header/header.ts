import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
  isLoggedIn = false;
  user: any = null;
  unreadNotifications = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
      
      if (user) {
        this.loadUnreadNotifications();
      }
    });
  }

  loadUnreadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadNotifications = count;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.router.navigate(['/user/profile']);
  }
}