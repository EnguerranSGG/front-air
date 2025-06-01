import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileEntity } from '../models/file.model';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = `${environment.API_URL}/files`;

  constructor(private http: HttpClient) {}

  getApiUrl(): string {
    return this.apiUrl;
  }

  getAll(): Observable<FileEntity[]> {
    return this.http.get<FileEntity[]>(`${this.apiUrl}/all`);
  }

  create(formData: FormData): Observable<FileEntity> {
    return this.http.post<FileEntity>(`${this.apiUrl}/upload`, formData);
  }

  update(id: number, formData: FormData): Observable<FileEntity> {
    return this.http.put<FileEntity>(`${this.apiUrl}/${id}`, formData);
  }

  updateMetadata(id: number, title: string): Observable<FileEntity> {
    const formData = new FormData();
    formData.append('title', title);
    return this.http.put<FileEntity>(`${this.apiUrl}/${id}/metadata`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getById(id: number): Observable<FileEntity> {
    return this.http.get<FileEntity>(`${this.apiUrl}/${id}`);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }
  
}
