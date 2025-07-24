import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Presentation } from '../models/presentation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PresentationService {
  private apiUrl = `${environment.API_URL}/presentations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Presentation[]> {
    return this.http.get<Presentation[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<Presentation> {
    return this.http.get<Presentation>(`${this.apiUrl}/${id}`);
  }

  update(id: number, presentation: Partial<Presentation>): Observable<Presentation> {
    return this.http.put<Presentation>(`${this.apiUrl}/${id}`, presentation);
  }
} 