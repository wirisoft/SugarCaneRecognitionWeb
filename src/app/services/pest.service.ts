// src/app/services/pest.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pest } from '../models/pest';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PestService {
  private apiUrl = 'http://localhost:8080/pests';

  constructor(private http: HttpClient) {}

  
  getAllPests(): Observable<Pest[]> {
    return this.http.get<Pest[]>(`${this.apiUrl}/get-all`);
  }
  
  getPestById(id: number): Observable<Pest> {
    return this.http.get<Pest>(`${this.apiUrl}/get/${id}`);
  }
  
  createPest(pest: Pest): Observable<Pest> {
    return this.http.post<Pest>(`${this.apiUrl}/create`, pest);
  }
  
  updatePest(id: number, pest: Pest): Observable<Pest> {
    return this.http.put<Pest>(`${this.apiUrl}/update/${id}`, pest);
  }
  
  deletePest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
