import { Component, OnInit } from '@angular/core';
import { NavBarDashboardCanaComponent } from "../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component";
import { BaseChartDirective } from 'ng2-charts';  // Changed this line
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [NavBarDashboardCanaComponent, BaseChartDirective],  // Changed this line
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  // Datos para la gráfica de temperatura y humedad
  public weatherData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: [25, 26, 28, 27, 29, 30],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Humedad (%)',
        data: [65, 70, 68, 72, 75, 70],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y1',
      }
    ]
  };

  // Datos para la gráfica de clima
  public climateData = {
    labels: ['Soleado', 'Nublado', 'Lluvia ligera', 'Lluvia fuerte'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: [
        '#FFD700',
        '#A9A9A9',
        '#87CEEB',
        '#4169E1'
      ]
    }]
  };

  // Datos para días óptimos de plantación
  public plantingData = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    datasets: [{
      label: 'Índice de Idoneidad para Plantación',
      data: [85, 88, 90, 85, 82, 80, 78],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  // Opciones para las gráficas
  public weatherOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperatura (°C)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humedad (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  public climateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución del Clima'
      }
    }
  };

  public plantingOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Días Óptimos para Plantación'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Índice de Idoneidad (%)'
        }
      }
    }
  };

  ngOnInit() {
    // Aumentamos el tamaño de la fuente y mejoramos el contraste
    Chart.defaults.font.size = 14;
    Chart.defaults.color = '#333';
    Chart.defaults.font.weight = 500;
  }
}
