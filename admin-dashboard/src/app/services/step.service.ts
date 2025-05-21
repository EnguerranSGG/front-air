import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Step } from '../models/step.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StepService {
  private baseUrl = `${environment.API_URL}/steps`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Step[]> {
    return this.http.get<Step[]>(`${this.baseUrl}/all`);
  }

  getByPathId(pathId: number): Observable<Step[]> {
    return this.http.get<Step[]>(`${this.baseUrl}/by-path/${pathId}`);
  }

  create(data: Omit<Step, 'step_id'>): Observable<Step> {
    return this.http.post<Step>(`${this.baseUrl}/add`, data);
  }

  update(id: number, data: Partial<Step>): Observable<Step> {
    return this.http.put<Step>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
