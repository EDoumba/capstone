import { Component } from '@angular/core';

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'] // corrected from styleUrl
})
export class UserManagement {

  // Users array with all fields used in the HTML
  users = [
    { name: 'Alice', role: 'admin', active: true, email: 'alice@example.com', joined: new Date('2025-01-15') },
    { name: 'Bob', role: 'user', active: false, email: 'bob@example.com', joined: new Date('2025-02-10') }
  ];

  // Columns displayed in the mat-table
  displayedColumns: string[] = ['name', 'role', 'status', 'joined', 'actions'];

  // Function to get color for roles
  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'warn';
      case 'user': return 'primary';
      default: return '';
    }
  }
}
