import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { News } from '../models/news.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = `${environment.API_URL}/news`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<News> {
    return this.http.post<News>(`${this.apiUrl}/add`, data);
  }

  update(id: number, data: any): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

