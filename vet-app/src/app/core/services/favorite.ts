import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vet } from './vet';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(private http: HttpClient) { }

  getFavorites(): Observable<Vet[]> {
    return this.http.get<Vet[]>('/api/favorites');
  }

  addFavorite(vetId: number): Observable<any> {
    return this.http.post('/api/favorites', { vetId });
  }

  removeFavorite(vetId: number): Observable<any> {
    return this.http.delete(`/api/favorites/${vetId}`);
  }

  isFavorite(vetId: number): Observable<boolean> {
    return this.http.get<boolean>(`/api/favorites/${vetId}/check`);
  }
}