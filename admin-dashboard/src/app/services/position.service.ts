import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Position } from '../models/position.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl = `${environment.API_URL}/positions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}/all`);
  }

  getOne(id: number): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/${id}`);
  }

}
