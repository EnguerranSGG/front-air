import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StructureType } from '../models/structure.model';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StructureTypeService {
  private apiUrl = `${environment.API_URL}/structure-types`;

  // Types par défaut en cas d'erreur API
  private defaultTypes: StructureType[] = [
    { structure_type_id: 1, name: 'Boutique solidaire' },
    { structure_type_id: 2, name: 'Pôle formation' },
    { structure_type_id: 3, name: 'Pôle asile' },
    { structure_type_id: 4, name: 'Pôle intégration' }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<StructureType[]> {
    return this.http.get<StructureType[]>(`${this.apiUrl}/all`);
  }

  // Méthode alternative qui utilise les types par défaut en cas d'erreur
  getAllWithFallback(): Observable<StructureType[]> {
    return new Observable(observer => {
      this.http.get<StructureType[]>(`${this.apiUrl}/all`).subscribe({
        next: (types) => {
          observer.next(types);
          observer.complete();
        },
        error: () => {
          // En cas d'erreur, utiliser les types par défaut
          observer.next(this.defaultTypes);
          observer.complete();
        }
      });
    });
  }

  getById(id: number): Observable<StructureType> {
    return this.http.get<StructureType>(`${this.apiUrl}/${id}`);
  }

  create(structureType: Partial<StructureType>): Observable<StructureType> {
    return this.http.post<StructureType>(`${this.apiUrl}/add`, structureType);
  }

  update(id: number, structureType: Partial<StructureType>): Observable<StructureType> {
    return this.http.put<StructureType>(`${this.apiUrl}/${id}`, structureType);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 