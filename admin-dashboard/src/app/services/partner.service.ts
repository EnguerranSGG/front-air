import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Partner } from '../models/partner.model';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private apiUrl = `${environment.API_URL}/partners`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<Partner> {
    return this.http.post<Partner>(`${this.apiUrl}`, data);
  }

  update(id: number, data: any): Observable<Partner> {
    return this.http.put<Partner>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 