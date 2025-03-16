import { Component } from '@angular/core';
import { NavBarDashboardCanaComponent } from '../components/nav-bar-dashboard-cana/nav-bar-dashboard-cana.component';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);


// Row Data Interface
interface IRow {
  Id: number;
  CorreoElectronico: string;
  NombreCompleto: string;
  Telefono: number;
  Roles: string;
  Estado: string;
  FechaCreacion: Date;
}
@Component({
  selector: 'app-users-dashboard-cana',
  standalone: true,
  imports: [NavBarDashboardCanaComponent, AgGridAngular],
  templateUrl: './users-dashboard-cana.component.html',
  styleUrl: './users-dashboard-cana.component.css'
})
export class UsersDashboardCanaComponent {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
    browserColorScheme: "light",
    headerFontSize: 14
  });
 
   // Row Data: The data to be displayed.
   rowData: IRow[] = [
    { Id: 1, NombreCompleto: "Pepe Ricolino" , CorreoElectronico: "Model Y", Telefono: 64950, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1)  },
    { Id: 5, NombreCompleto: "Pepe Ricolino", CorreoElectronico: "F-Series", Telefono: 33850, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1)   },
    { Id: 6, NombreCompleto: "Pepe Ricolino", CorreoElectronico: "Corolla", Telefono: 29600, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1)    },
    { Id: 7, NombreCompleto: "Pepe Ricolino", CorreoElectronico: "EQA", Telefono: 48890, Roles: "usuario",  Estado: "Activo", FechaCreacion: new Date(2023, 1, 1)     },
    { Id: 8, NombreCompleto: "Pepe Ricolino",  CorreoElectronico: "500", Telefono: 15774, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 9, NombreCompleto: "Pepe Ricolino", CorreoElectronico: "Juke", Telefono: 20675, Roles: "usuario", Estado: "Activo", FechaCreacion: new Date(2023, 1, 1)   },
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef<IRow>[] = [
    { field: "Id", flex: 4, },
    { field: "NombreCompleto", sortable: true, editable: true },
    { field: "CorreoElectronico", sortable: true, editable: true },
    { field: "Telefono", sortable: true, editable: true },
    { field: "Roles" ,sortable: true, editable: true },
    { field: "Estado", sortable: true, editable: true },
    { field: "FechaCreacion", sortable: true },
  ];

  defaultColDef: ColDef = {
    flex: 1,
  };
}
