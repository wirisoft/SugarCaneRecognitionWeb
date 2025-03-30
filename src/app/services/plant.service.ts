// src/app/services/plant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plant } from '../models/plant';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private apiUrl = 'http://localhost:8080/plants';

  constructor(private http: HttpClient) {}

  getAllPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.apiUrl}/get-all`);
  }

  getPlantById(id: number): Observable<Plant> {
    return this.http.get<Plant>(`${this.apiUrl}/get/${id}`);
  }

  createPlant(plant: Plant): Observable<Plant> {
    return this.http.post<Plant>(`${this.apiUrl}/create`, plant);
  }

  updatePlant(id: number, plant: Plant): Observable<Plant> {
    return this.http.put<Plant>(`${this.apiUrl}/update/${id}`, plant);
  }

  deletePlant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
