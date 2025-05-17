import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Value } from '../models/value.model';

@Injectable({
  providedIn: 'root'
})
export class ValueService {
  private apiUrl = `${environment.API_URL}/values`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Value[]> {
    return this.http.get<Value[]>(`${this.apiUrl}/all`);
  }

  create(data: Partial<Value>): Observable<Value> {
    return this.http.post<Value>(`${this.apiUrl}/add`, data);
  }

  update(id: number, data: Partial<Value>): Observable<Value> {
    return this.http.put<Value>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
