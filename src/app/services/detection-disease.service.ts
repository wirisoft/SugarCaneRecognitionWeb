// src/app/services/detection-disease.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DetectionDisease } from '../models/detection-disease';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionDiseaseService {
  private apiUrl = 'http://localhost:8080/detection-diseases';

  constructor(private http: HttpClient) {}

  getAllDetectionDiseases(): Observable<DetectionDisease[]> {
    return this.http.get<DetectionDisease[]>(`${this.apiUrl}/get-all`);
  }

  getDetectionDiseaseById(id: number): Observable<DetectionDisease> {
    return this.http.get<DetectionDisease>(`${this.apiUrl}/get/${id}`);
  }

  createDetectionDisease(dd: DetectionDisease): Observable<DetectionDisease> {
    return this.http.post<DetectionDisease>(`${this.apiUrl}/create`, dd);
  }

  updateDetectionDisease(id: number, dd: DetectionDisease): Observable<DetectionDisease> {
    return this.http.put<DetectionDisease>(`${this.apiUrl}/update/${id}`, dd);
  }

  deleteDetectionDisease(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
