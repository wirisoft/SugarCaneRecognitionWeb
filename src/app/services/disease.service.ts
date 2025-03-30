// src/app/services/disease.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Disease } from '../models/disease';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  private apiUrl = 'http://localhost:8080/diseases';

  constructor(private http: HttpClient) {}

  getAllDiseases(): Observable<Disease[]> {
    return this.http.get<Disease[]>(`${this.apiUrl}/get-all`);
  }

  getDiseaseById(id: number): Observable<Disease> {
    return this.http.get<Disease>(`${this.apiUrl}/get/${id}`);
  }

  createDisease(disease: Disease): Observable<Disease> {
    return this.http.post<Disease>(`${this.apiUrl}/create`, disease);
  }

  updateDisease(id: number, disease: Disease): Observable<Disease> {
    return this.http.put<Disease>(`${this.apiUrl}/update/${id}`, disease);
  }

  deleteDisease(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
