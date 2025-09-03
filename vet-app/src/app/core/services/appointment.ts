import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number;
  vetId: number;
  vetName: string;
  userId: number;
  userName: string;
  petId: number;
  petName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  notes: string;
}

export interface CreateAppointmentData {
  vetId: number;
  petId: number;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>('/api/appointments');
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`/api/appointments/${id}`);
  }

  createAppointment(appointmentData: CreateAppointmentData): Observable<Appointment> {
    return this.http.post<Appointment>('/api/appointments', appointmentData);
  }

  updateAppointment(id: number, updates: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`/api/appointments/${id}`, updates);
  }

  cancelAppointment(id: number): Observable<any> {
    return this.http.delete(`/api/appointments/${id}`);
  }

  getAvailableTimes(vetId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/appointments/available-times/${vetId}?date=${date}`);
  }
}