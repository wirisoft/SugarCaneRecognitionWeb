// src/app/services/detection-image.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DetectionImage } from '../models/detection-image';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionImageService {
  private apiUrl = 'http://localhost:8080/detection-images';

  constructor(private http: HttpClient) {}

  getAllDetectionImages(): Observable<DetectionImage[]> {
    return this.http.get<DetectionImage[]>(`${this.apiUrl}/get-all`);
  }

  getDetectionImageById(id: number): Observable<DetectionImage> {
    return this.http.get<DetectionImage>(`${this.apiUrl}/get/${id}`);
  }

  createDetectionImage(image: DetectionImage): Observable<DetectionImage> {
    return this.http.post<DetectionImage>(`${this.apiUrl}/create`, image);
  }

  updateDetectionImage(id: number, image: DetectionImage): Observable<DetectionImage> {
    return this.http.put<DetectionImage>(`${this.apiUrl}/update/${id}`, image);
  }

  deleteDetectionImage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
