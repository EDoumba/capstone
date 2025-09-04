import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  pets: Pet[];
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/api/user/profile`);
  }

  updateProfile(profileData: any): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/api/user/profile`, profileData);
  }

  addPet(petData: any): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/api/user/pets1, petData);
  }

  updatePet(petId: number, petData: any): Observable<Pet> {
    return this.http.put<Pet>(`/api/user/pets/${petId}`, petData);
  }

  deletePet(petId: number): Observable<any> {
    return this.http.delete(`/api/user/pets/${petId}`);
  }
}