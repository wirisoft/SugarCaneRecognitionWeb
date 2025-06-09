// src/app/services/history.service.ts

import { Injectable } from '@angular/core';
import { ExtendedPredictionResult } from './diagnosis.service';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  fileName: string;
  imageBase64: string; // Imagen en base64 para mostrar en historial
  predictionResult: ExtendedPredictionResult;
  confidence: number;
  diagnosisName: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'cane_diagnosis_history';
  private readonly MAX_HISTORY_ENTRIES = 50; // Límite para evitar llenar el localStorage

  constructor() { }

  /**
   * Guarda una nueva entrada en el historial
   */
  saveToHistory(
    fileName: string, 
    imageBase64: string, 
    predictionResult: ExtendedPredictionResult
  ): void {
    try {
      const entry: HistoryEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        fileName: fileName,
        imageBase64: imageBase64,
        predictionResult: predictionResult,
        confidence: predictionResult.confidence,
        diagnosisName: predictionResult.plaga_info?.nombre_comun || predictionResult.class_name
      };

      const history = this.getHistory();
      
      // Agregar nueva entrada al inicio
      history.unshift(entry);
      
      // Mantener solo las últimas MAX_HISTORY_ENTRIES entradas
      if (history.length > this.MAX_HISTORY_ENTRIES) {
        history.splice(this.MAX_HISTORY_ENTRIES);
      }
      
      // Guardar en localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      
      console.log('Entrada guardada en historial:', entry.diagnosisName);
    } catch (error) {
      console.error('Error al guardar en historial:', error);
      // Si localStorage está lleno, limpiar entradas antiguas
      this.clearOldEntries();
    }
  }

  /**
   * Obtiene todo el historial
   */
  getHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      
      // Convertir las fechas de string a Date
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('Error al cargar historial:', error);
      return [];
    }
  }

  /**
   * Obtiene las últimas N entradas del historial
   */
  getRecentHistory(limit: number = 10): HistoryEntry[] {
    return this.getHistory().slice(0, limit);
  }

  /**
   * Busca en el historial por nombre de diagnóstico
   */
  searchHistory(searchTerm: string): HistoryEntry[] {
    const history = this.getHistory();
    const term = searchTerm.toLowerCase();
    
    return history.filter(entry => 
      entry.diagnosisName.toLowerCase().includes(term) ||
      entry.fileName.toLowerCase().includes(term) ||
      entry.predictionResult.plaga_info?.nombre_cientifico?.toLowerCase().includes(term)
    );
  }

  /**
   * Filtra historial por rango de fechas
   */
  getHistoryByDateRange(startDate: Date, endDate: Date): HistoryEntry[] {
    const history = this.getHistory();
    
    return history.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  /**
   * Filtra historial por nivel de confianza mínimo
   */
  getHistoryByConfidence(minConfidence: number): HistoryEntry[] {
    const history = this.getHistory();
    
    return history.filter(entry => entry.confidence >= minConfidence);
  }

  /**
   * Elimina una entrada específica del historial
   */
  deleteHistoryEntry(entryId: string): boolean {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(entry => entry.id !== entryId);
      
      if (filteredHistory.length < history.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar entrada del historial:', error);
      return false;
    }
  }

  /**
   * Limpia todo el historial
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Historial limpiado completamente');
    } catch (error) {
      console.error('Error al limpiar historial:', error);
    }
  }

  /**
   * Limpia entradas antiguas (más de 30 días)
   */
  clearOldEntries(): void {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const history = this.getHistory();
      const recentHistory = history.filter(entry => entry.timestamp > thirtyDaysAgo);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentHistory));
      console.log(`Limpiadas ${history.length - recentHistory.length} entradas antiguas`);
    } catch (error) {
      console.error('Error al limpiar entradas antiguas:', error);
    }
  }

  /**
   * Obtiene estadísticas del historial
   */
  getHistoryStats(): {
    totalEntries: number;
    averageConfidence: number;
    mostCommonDiagnosis: string;
    dateRange: { oldest: Date | null; newest: Date | null };
  } {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return {
        totalEntries: 0,
        averageConfidence: 0,
        mostCommonDiagnosis: 'N/A',
        dateRange: { oldest: null, newest: null }
      };
    }

    // Calcular confianza promedio
    const avgConfidence = history.reduce((sum, entry) => sum + entry.confidence, 0) / history.length;

    // Encontrar diagnóstico más común
    const diagnosisCounts: { [key: string]: number } = {};
    history.forEach(entry => {
      const diagnosis = entry.diagnosisName;
      diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
    });
    
    const mostCommon = Object.keys(diagnosisCounts).reduce((a, b) => 
      diagnosisCounts[a] > diagnosisCounts[b] ? a : b
    );

    // Rango de fechas
    const dates = history.map(entry => entry.timestamp).sort((a, b) => a.getTime() - b.getTime());
    
    return {
      totalEntries: history.length,
      averageConfidence: avgConfidence,
      mostCommonDiagnosis: mostCommon,
      dateRange: {
        oldest: dates[0],
        newest: dates[dates.length - 1]
      }
    };
  }

  /**
   * Exporta el historial como JSON
   */
  exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Importa historial desde JSON
   */
  importHistory(jsonData: string): boolean {
    try {
      const importedHistory = JSON.parse(jsonData);
      
      // Validar estructura básica
      if (!Array.isArray(importedHistory)) {
        throw new Error('El archivo no contiene un array válido');
      }

      // Convertir fechas y validar entradas
      const validatedHistory = importedHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })).filter(entry => 
        entry.id && entry.timestamp && entry.diagnosisName
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validatedHistory));
      return true;
    } catch (error) {
      console.error('Error al importar historial:', error);
      return false;
    }
  }

  /**
   * Genera un ID único para las entradas
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}