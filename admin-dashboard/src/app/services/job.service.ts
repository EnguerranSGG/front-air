import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/job.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.API_URL}/jobs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/all`);
  }

  getByPosition(positionId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/by-position/${positionId}`);
  }

  getOne(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/add`, data);
  }

  update(id: number, data: Partial<Job>): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
