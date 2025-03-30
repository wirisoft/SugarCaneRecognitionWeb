// src/app/services/detection-history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DetectionHistory } from '../models/detection-history';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionHistoryService {
  private apiUrl = 'http://localhost:8080/detection-history';

  constructor(private http: HttpClient) {}

  getAllDetectionHistories(): Observable<DetectionHistory[]> {
    return this.http.get<DetectionHistory[]>(`${this.apiUrl}/get-all`);
  }

  getDetectionHistoryById(id: number): Observable<DetectionHistory> {
    return this.http.get<DetectionHistory>(`${this.apiUrl}/get/${id}`);
  }

  createDetectionHistory(history: DetectionHistory): Observable<DetectionHistory> {
    return this.http.post<DetectionHistory>(`${this.apiUrl}/create`, history);
  }

  updateDetectionHistory(id: number, history: DetectionHistory): Observable<DetectionHistory> {
    return this.http.put<DetectionHistory>(`${this.apiUrl}/update/${id}`, history);
  }

  deleteDetectionHistory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
