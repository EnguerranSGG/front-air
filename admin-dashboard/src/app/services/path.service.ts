import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Path } from '../models/path.model';

@Injectable({ providedIn: 'root' })
export class PathService {
  private baseUrl = 'http://localhost:3000/api/paths';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Path[]> {
    return this.http.get<Path[]>(this.baseUrl);
  }
}
