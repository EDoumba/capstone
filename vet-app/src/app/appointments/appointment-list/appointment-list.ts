import { Component } from '@angular/core';

interface Appointment {
  id: number;
  vetId: number;
  vetName: string;
  petName: string;
  date: string;   // or Date
  time: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-appointment-list',
  standalone: false,
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.scss'],

})
export class AppointmentList {

  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];

  constructor() {
    // Example data, you can replace this with API calls
    this.upcomingAppointments = [
      {
        id: 1,
        vetId: 101,
        vetName: 'Smith',
        petName: 'Buddy',
        date: '2025-09-05',
        time: '10:00 AM',
        reason: 'Vaccination',
        status: 'upcoming'
      }
    ];

    this.pastAppointments = [
      {
        id: 2,
        vetId: 102,
        vetName: 'Johnson',
        petName: 'Max',
        date: '2025-08-20',
        time: '02:00 PM',
        reason: 'Checkup',
        status: 'completed'
      }
    ];
  }

  // Returns a color name for mat-chip based on status
  getStatusColor(status: string): string {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': return 'warn';
      default: return '';
    }
  }

  cancelAppointment(appointmentId: number) {
    console.log('Cancel appointment', appointmentId);
    // TODO: Add logic to cancel the appointment
  }

  rescheduleAppointment(appointment: Appointment) {
    console.log('Reschedule appointment', appointment);
    // TODO: Add logic to reschedule
  }

  bookAgain(vetId: number) {
    console.log('Book again with vet', vetId);
    // TODO: Add logic to book again
  }
}
