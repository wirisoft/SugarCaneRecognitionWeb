// src/app/services/detection.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Detection } from '../models/detection';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionService {
  // Ajusta la URL base según tu API
  private apiUrl = 'http://localhost:8080/detections';

  constructor(private http: HttpClient) {}

  getAllDetections(): Observable<Detection[]> {
    return this.http.get<Detection[]>(`${this.apiUrl}/get-all`);
  }

  getDetectionById(id: number): Observable<Detection> {
    return this.http.get<Detection>(`${this.apiUrl}/get/${id}`);
  }

  createDetection(detection: Detection): Observable<Detection> {
    return this.http.post<Detection>(`${this.apiUrl}/create`, detection);
  }

  updateDetection(id: number, detection: Detection): Observable<Detection> {
    return this.http.put<Detection>(`${this.apiUrl}/update/${id}`, detection);
  }

  deleteDetection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
