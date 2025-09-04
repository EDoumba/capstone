import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ';

export interface Vet {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: number;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
  availability: Availability[];
}

export interface Availability {
  day: string;
  times: string[];
}

export interface VetSearchParams {
  specialty?: string;
  rating?: number;
  name?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VetService {

  constructor(private http: HttpClient) { }

  getVets(params?: VetSearchParams): Observable<{ vets: Vet[], total: number }> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof VetSearchParams] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof VetSearchParams] as string);
        }
      });
    }
    
    return this.http.get<{ vets: Vet[], total: number }>(`${this.apiUrl}/api/vets`, { params: httpParams });
  }

  getVetById(id: number): Observable<Vet> {
    return this.http.get<Vet>(`/api/vets/${id}`);
  }

  getFeaturedVets(): Observable<Vet[]> {
    return this.http.get<Vet[]>('/api/vets/featured');
  }

  getVetSpecialties(): Observable<string[]> {
    return this.http.get<string[]>('/api/vets/specialties');
  }
}