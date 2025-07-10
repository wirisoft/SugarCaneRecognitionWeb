// dashboard-home.component.ts - Mejorado con colores específicos por enfermedad
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavBarDashboardCanaComponent } from "../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component";
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';

// Ajusta esta ruta según la estructura de tu proyecto
import { DiagnosisService } from '../../services/diagnosis.service';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { CanPerformDirective } from '../../directives/can-perform.directive';
import { AdminOnlyDirective } from '../../directives/admin-only.directive';

// Definir interfaces localmente para evitar problemas de importación
interface DetectionHistory {
  id: string;
  timestamp: string;
  prediction: {
    class_id: number;
    class_name: string;
    confidence: number;
    all_predictions: { [key: string]: number };
  };
  processing_info: any;
  user_info: any;
  metadata: any;
  has_image: boolean;
}

interface DetectionStatistics {
  total_detections: number;
  detections_by_class: Array<{
    _id: string;
    count: number;
    avg_confidence: number;
  }>;
  daily_detections_last_7_days: Array<{
    _id: string;
    count: number;
  }>;
  last_updated: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavBarDashboardCanaComponent, 
    BaseChartDirective,
    HasRoleDirective,        // ✅ Para *appHasRole
    AdminOnlyDirective,      // ✅ Para *appAdminOnly
    CanPerformDirective      // ✅ Para *appCanPerform
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Propiedad para la fecha actual
  currentDate = new Date();

  // Paleta de colores del proyecto
  private colorPalette = {
    primary: '#5fc871',
    light: ['#f2fbf3', '#e1f7e4', '#c4eecb', '#95e0a1'],
    medium: ['#3aad4e', '#2b8e3c', '#257032'],
    dark: ['#22592c', '#1d4a26', '#0b2811']
  };

  // Colores específicos por enfermedad y plaga
  private diseaseColors: { [key: string]: string } = {
    'healthy_cane (HC)': '#2ECC71',        // Verde saludable
    'yellow (Y)': '#F1C40F',              // Amarillo para amarillamiento
    'painted_fly (PF)': '#E74C3C',        // Rojo para mosca pintada
    'red_rot (RR)': '#8B4513',            // Marrón rojizo para pudrición roja
    'roya (R)': '#FF8C00',                // Naranja para roya
    'leaf_scald (LS)': '#9B59B6',         // Púrpura para escaldadura
    'mosaic_virus (MV)': '#3498DB',       // Azul para virus del mosaico
  };

  // Estado de carga para detecciones
  isLoadingDetections = true;
  detectionsError = false;

  // Datos de detecciones
  recentDetections: DetectionHistory[] = [];
  detectionStatistics: DetectionStatistics | null = null;
  
  // Filtros
  selectedClassFilter = '';
  availableClasses = [
    { value: '', label: 'Todas las enfermedades' },
    { value: 'healthy_cane (HC)', label: 'Caña Saludable' },
    { value: 'leaf_scald (LS)', label: 'Escaldadura' },
    { value: 'mosaic_virus (MV)', label: 'Virus del Mosaico' },
    { value: 'painted_fly (PF)', label: 'Mosca Pintada' },
    { value: 'red_rot (RR)', label: 'Pudrición Roja' },
    { value: 'roya (R)', label: 'Roya' },
    { value: 'yellow (Y)', label: 'Amarillamiento' }
  ];

  // Datos para las gráficas de detecciones
  public detectionsByClassData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  public dailyDetectionsData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public confidenceDistributionData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  // Opciones mejoradas para gráficas de detecciones
  public doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#0b2811',
          font: {
            size: 12,
            weight: 600
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Distribución de Enfermedades Detectadas',
        color: '#0b2811',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(11, 40, 17, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#5fc871',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff'
      }
    }
  };

  public lineDetectionsOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0b2811',
          font: {
            size: 12,
            weight: 600
          },
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Detecciones Diarias (Últimos 7 días)',
        color: '#0b2811',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(11, 40, 17, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#5fc871',
        borderWidth: 2,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Detecciones',
          color: '#257032',
          font: {
            size: 12,
            weight: 600
          }
        },
        ticks: {
          color: '#257032',
          font: {
            size: 11,
            weight: 500
          }
        },
        grid: {
          color: 'rgba(95, 200, 113, 0.1)',
          lineWidth: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
          color: '#257032',
          font: {
            size: 12,
            weight: 600
          }
        },
        ticks: {
          color: '#257032',
          font: {
            size: 11,
            weight: 500
          }
        },
        grid: {
          color: 'rgba(95, 200, 113, 0.1)',
          lineWidth: 1
        }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 3,
        backgroundColor: '#ffffff'
      },
      line: {
        tension: 0.4,
        borderWidth: 3
      }
    }
  };

  public barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0b2811',
          font: {
            size: 12,
            weight: 600
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Confianza Promedio por Enfermedad',
        color: '#0b2811',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(11, 40, 17, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#5fc871',
        borderWidth: 2,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            return `Confianza: ${(Number(context.parsed.y) * 100).toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Confianza Promedio',
          color: '#257032',
          font: {
            size: 12,
            weight: 600
          }
        },
        ticks: {
          color: '#257032',
          font: {
            size: 11,
            weight: 500
          },
          callback: function(value: any) {
            return (Number(value) * 100).toFixed(0) + '%';
          }
        },
        grid: {
          color: 'rgba(95, 200, 113, 0.1)',
          lineWidth: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tipo de Enfermedad',
          color: '#257032',
          font: {
            size: 12,
            weight: 600
          }
        },
        ticks: {
          color: '#257032',
          font: {
            size: 11,
            weight: 500
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: 'rgba(95, 200, 113, 0.1)',
          lineWidth: 1
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
        borderWidth: 2
      }
    }
  };

  constructor(private diagnosisService: DiagnosisService) {}

  ngOnInit() {
    // Configurar Chart.js con la paleta de colores
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#0b2811';
    Chart.defaults.font.weight = 500;

    // Actualizar fecha cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    // Verificar si el servicio está disponible antes de cargar datos
    this.checkServiceAndLoadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkServiceAndLoadData() {
    if (this.diagnosisService) {
      this.loadDetectionData();
    } else {
      console.warn('DiagnosisService no está disponible');
      this.isLoadingDetections = false;
      this.detectionsError = true;
    }
  }

  loadDetectionData() {
    this.isLoadingDetections = true;
    this.detectionsError = false;

    if (!this.diagnosisService.getGeneralStatistics || !this.diagnosisService.getRecentDetections) {
      console.error('Los métodos del servicio no están disponibles');
      this.detectionsError = true;
      this.isLoadingDetections = false;
      return;
    }

    const requests = [
      this.diagnosisService.getGeneralStatistics().pipe(
        catchError((err: any) => {
          console.error('Error al cargar estadísticas:', err);
          return of(null);
        })
      ),
      this.diagnosisService.getRecentDetections(10).pipe(
        catchError((err: any) => {
          console.error('Error al cargar detecciones:', err);
          return of([]);
        })
      )
    ];

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any[]) => {
          const statistics = results[0];
          const detections = results[1];
          
          this.detectionStatistics = statistics;
          this.recentDetections = detections || [];
          
          if (statistics) {
            this.updateDetectionCharts();
          }
          
          this.isLoadingDetections = false;
        },
        error: (error: any) => {
          console.error('Error general:', error);
          this.detectionsError = true;
          this.isLoadingDetections = false;
        }
      });
  }

  private updateDetectionCharts() {
    if (!this.detectionStatistics) return;

    this.updateDetectionsByClassChart();
    this.updateDailyDetectionsChart();
    this.updateConfidenceChart();
  }

  // Método helper para obtener el color específico de cada enfermedad
  private getDiseaseChartColor(className: string): string {
    return this.diseaseColors[className] || '#95E0A1'; // Color por defecto si no se encuentra
  }

  private updateDetectionsByClassChart() {
    if (!this.detectionStatistics?.detections_by_class) return;

    // Crear colores específicos para cada enfermedad
    const backgroundColors = this.detectionStatistics.detections_by_class.map(item => 
      this.getDiseaseChartColor(item._id)
    );

    // Crear versiones más claras para hover (añadir transparencia)
    const hoverColors = backgroundColors.map(color => color + 'CC');

    this.detectionsByClassData = {
      labels: this.detectionStatistics.detections_by_class.map(item => 
        this.getDiseaseDisplayName(item._id)
      ),
      datasets: [{
        data: this.detectionStatistics.detections_by_class.map(item => item.count),
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 4
      }]
    };
  }

  private updateDailyDetectionsChart() {
    if (!this.detectionStatistics?.daily_detections_last_7_days) return;

    // Crear array de los últimos 7 días
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    // Mapear datos existentes
    const dataMap = new Map();
    this.detectionStatistics.daily_detections_last_7_days.forEach(item => {
      dataMap.set(item._id, item.count);
    });

    // Crear datos completos
    const dailyCounts = last7Days.map(date => dataMap.get(date) || 0);
    const labels = last7Days.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    });

    this.dailyDetectionsData = {
      labels: labels,
      datasets: [{
        label: 'Detecciones Diarias',
        data: dailyCounts,
        borderColor: this.colorPalette.primary,
        backgroundColor: this.colorPalette.primary + '20', // 20% de opacidad
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: this.colorPalette.primary,
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: this.colorPalette.primary,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3
      }]
    };
  }

  private updateConfidenceChart() {
    if (!this.detectionStatistics?.detections_by_class) return;

    // Usar los mismos colores específicos para la gráfica de confianza
    const backgroundColors = this.detectionStatistics.detections_by_class.map((item, index) => {
      const baseColor = this.getDiseaseChartColor(item._id);
      // Crear gradiente basado en el valor de confianza
      const opacity = Math.max(0.6, item.avg_confidence);
      return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    });

    const borderColors = this.detectionStatistics.detections_by_class.map(item => 
      this.getDiseaseChartColor(item._id)
    );

    this.confidenceDistributionData = {
      labels: this.detectionStatistics.detections_by_class.map(item => 
        this.getDiseaseDisplayName(item._id)
      ),
      datasets: [{
        label: 'Confianza Promedio',
        data: this.detectionStatistics.detections_by_class.map(item => item.avg_confidence),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverBackgroundColor: borderColors,
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3
      }]
    };
  }

  filterByClass() {
    if (!this.selectedClassFilter) {
      this.loadDetectionData();
      return;
    }

    if (!this.diagnosisService.getDetectionsByClass) {
      console.error('Método getDetectionsByClass no disponible');
      return;
    }

    this.isLoadingDetections = true;
    this.diagnosisService.getDetectionsByClass(this.selectedClassFilter, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detections: any) => {
          this.recentDetections = detections;
          this.isLoadingDetections = false;
        },
        error: (error: any) => {
          console.error('Error al filtrar:', error);
          this.detectionsError = true;
          this.isLoadingDetections = false;
        }
      });
  }

  clearFilter() {
    this.selectedClassFilter = '';
    this.filterByClass();
  }

  // Métodos helper mejorados
  getDiseaseDisplayName(className: string): string {
    const diseaseNames: { [key: string]: string } = {
      'healthy_cane (HC)': 'Caña Saludable',
      'leaf_scald (LS)': 'Escaldadura',
      'mosaic_virus (MV)': 'Virus del Mosaico',
      'painted_fly (PF)': 'Mosca Pintada',
      'red_rot (RR)': 'Pudrición Roja',
      'roya (R)': 'Roya',
      'yellow (Y)': 'Amarillamiento'
    };
    return diseaseNames[className] || className;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-danger';
  }

  getConfidenceText(confidence: number): string {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  }

  getConfidenceBadgeColor(confidence: number): string {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  }

  getDiseaseColor(className: string): string {
    return this.getDiseaseChartColor(className);
  }

  getStatusIcon(className: string): string {
    if (className.includes('healthy')) return 'fas fa-check-circle';
    if (className.includes('roya') || className.includes('red_rot')) return 'fas fa-exclamation-triangle';
    return 'fas fa-exclamation-circle';
  }

  trackByDetectionId(index: number, detection: DetectionHistory): string {
    return detection.id;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDetectionStatusClass(className: string): string {
    if (className.includes('healthy')) return 'badge bg-success';
    if (className.includes('roya') || className.includes('red_rot')) return 'badge bg-danger';
    return 'badge bg-warning';
  }

  // Métodos helper adicionales para el template simplificado
  getDetectionClassesCount(): number {
    return this.detectionStatistics?.detections_by_class?.length || 0;
  }

  getMostCommonCount(): number {
    return this.detectionStatistics?.detections_by_class?.[0]?.count || 0;
  }

  getNoDetectionsMessage(): string {
    return this.selectedClassFilter 
      ? 'No hay registros para el filtro seleccionado.' 
      : 'Aún no hay detecciones registradas en el sistema.';
  }

  getShortId(id: string): string {
    return id.substring(0, 8) + '...';
  }

  getConfidencePercentage(confidence: number): string {
    return (confidence * 100).toFixed(1);
  }

  getBadgeClass(confidence: number): string {
    return 'bg-' + this.getConfidenceBadgeColor(confidence);
  }

  isUserAuthenticated(detection: DetectionHistory): boolean {
    return detection.user_info?.is_authenticated || false;
  }

  getUserEmail(detection: DetectionHistory): string {
    return detection.user_info?.user?.email || 'Usuario registrado';
  }

  getStatusText(className: string): string {
    return className.includes('healthy') ? 'Saludable' : 'Requiere Atención';
  }
}