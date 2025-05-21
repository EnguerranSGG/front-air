import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Structure } from '../models/structure.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StructureService {
  private apiUrl = `${environment.API_URL}/structures`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Structure[]> {
    return this.http.get<Structure[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<Structure> {
    return this.http.get<Structure>(`${this.apiUrl}/${id}`);
  }

  create(structure: Partial<Structure>): Observable<Structure> {
    return this.http.post<Structure>(`${this.apiUrl}/add`, structure);
  }

  update(id: number, structure: Partial<Structure>): Observable<Structure> {
    return this.http.put<Structure>(`${this.apiUrl}/${id}`, structure);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
