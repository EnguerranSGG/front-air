import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StatisticType {
  type_id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticTypeService {
  private readonly baseUrl = `${environment.API_URL}/types/all`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StatisticType[]> {
    return this.http.get<StatisticType[]>(this.baseUrl);
  }
}
