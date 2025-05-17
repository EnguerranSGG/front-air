import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Time } from '../models/time.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimeService {
  private apiUrl = `${environment.API_URL}/times`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Time[]> {
    return this.http.get<Time[]>(`${this.apiUrl}/all`);
  }

  create(time: Partial<Time>) {
    return this.http.post<Time>(`${this.apiUrl}/add`, time);
  }  

  update(time_id: number, time: Partial<Time>): Observable<Time> {
    return this.http.put<Time>(`${this.apiUrl}/${time_id}`, time);
  }

  delete(time_id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${time_id}`);
  }
}
