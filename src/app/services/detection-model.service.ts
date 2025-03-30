// src/app/services/detection-model.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DetectionModel } from '../models/detection-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionModelService {
  private apiUrl = 'http://localhost:8080/detection-models';

  constructor(private http: HttpClient) {}

  getAllDetectionModels(): Observable<DetectionModel[]> {
    return this.http.get<DetectionModel[]>(`${this.apiUrl}/get-all`);
  }

  getDetectionModelById(id: number): Observable<DetectionModel> {
    return this.http.get<DetectionModel>(`${this.apiUrl}/get/${id}`);
  }

  createDetectionModel(model: DetectionModel): Observable<DetectionModel> {
    return this.http.post<DetectionModel>(`${this.apiUrl}/create`, model);
  }

  updateDetectionModel(id: number, model: DetectionModel): Observable<DetectionModel> {
    return this.http.put<DetectionModel>(`${this.apiUrl}/update/${id}`, model);
  }

  deleteDetectionModel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
