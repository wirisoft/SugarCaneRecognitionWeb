// src/app/services/detection-pest.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DetectionPest } from '../models/detection-pest';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionPestService {
  private apiUrl = 'http://vps-4243804-x.dattaweb.com:8080/api/detection-pests';

  constructor(private http: HttpClient) {}

  getAllDetectionPests(): Observable<DetectionPest[]> {
    return this.http.get<DetectionPest[]>(`${this.apiUrl}/get-all`);
  }

  getDetectionPestById(id: number): Observable<DetectionPest> {
    return this.http.get<DetectionPest>(`${this.apiUrl}/get/${id}`);
  }

  createDetectionPest(dp: DetectionPest): Observable<DetectionPest> {
    return this.http.post<DetectionPest>(`${this.apiUrl}/create`, dp);
  }

  updateDetectionPest(id: number, dp: DetectionPest): Observable<DetectionPest> {
    return this.http.put<DetectionPest>(`${this.apiUrl}/update/${id}`, dp);
  }

  deleteDetectionPest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
