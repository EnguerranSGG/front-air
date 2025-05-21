import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statistic } from '../models/statistic.modele';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private readonly baseUrl = `${environment.API_URL}/statistics`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Statistic[]> {
    return this.http.get<Statistic[]>(this.baseUrl);
  }

  getById(id: number): Observable<Statistic> {
    return this.http.get<Statistic>(`${this.baseUrl}/${id}`);
  }

  getByType(typeId: number): Observable<Statistic[]> {
    return this.http.get<Statistic[]>(`${this.baseUrl}/by-type/${typeId}`);
  }

  create(statistic: any): Observable<Statistic> {
    return this.http.post<Statistic>(`${this.baseUrl}/add`, statistic);
  }

  update(id: number, statistic: any): Observable<Statistic> {
    return this.http.put<Statistic>(`${this.baseUrl}/${id}`, statistic);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
