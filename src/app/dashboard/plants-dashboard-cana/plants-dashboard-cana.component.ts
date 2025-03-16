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
  NombreComun: string;
  NombreoCientifico: string;
  descripcion: string;
  imagen: string;
  creador: string;
  FechaCreacion: Date;
}

@Component({
  selector: 'app-plants-dashboard-cana',
  standalone: true,
  imports: [NavBarDashboardCanaComponent, AgGridAngular ],
  templateUrl: './plants-dashboard-cana.component.html',
  styleUrl: './plants-dashboard-cana.component.css'
})
export class PlantsDashboardCanaComponent {
  public myTheme = themeQuartz.withParams({
    accentColor: "#00FF6B",
        borderRadius: 10,
        browserColorScheme: "light",
        columnBorder: false,
        fontFamily: {
            googleFont: "Open Sans"
        },
        headerFontSize: 14,
        headerRowBorder: true,
        oddRowBackgroundColor: "#FFFFFF",
        rowBorder: false,
        wrapperBorder: true,
        wrapperBorderRadius: 12
  });
 
   // Row Data: The data to be displayed.
   rowData: IRow[] = [
    { Id: 1, NombreComun: "Pepe Ricolino" , NombreoCientifico: "Model Y", descripcion: "pepepepepe", imagen: "usuario", creador: "Activo", FechaCreacion: new Date(2023, 1, 1)  },
    { Id: 5, NombreComun: "Pepe Ricolino", NombreoCientifico: "F-Series", descripcion: "pepepepepe", imagen: "usuario", creador: "Activo", FechaCreacion: new Date(2023, 1, 1)   },
    { Id: 6, NombreComun: "Pepe Ricolino", NombreoCientifico: "Corolla", descripcion: "pepepepepe", imagen: "usuario", creador: "Activo", FechaCreacion: new Date(2023, 1, 1)    },
    { Id: 7, NombreComun: "Pepe Ricolino", NombreoCientifico: "EQA", descripcion: "pepepepepe", imagen: "usuario",  creador: "Activo", FechaCreacion: new Date(2023, 1, 1)     },
    { Id: 8, NombreComun: "Pepe Ricolino", NombreoCientifico: "500", descripcion: "pepepepepe", imagen: "usuario", creador: "Activo", FechaCreacion: new Date(2023, 1, 1) },
    { Id: 9, NombreComun: "Pepe Ricolino", NombreoCientifico: "Juke", descripcion: "pepepepepe", imagen: "usuario", creador: "Activo", FechaCreacion: new Date(2023, 1, 1)   },
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef<IRow>[] = [
    { field: "Id", flex: 4, },
    { field: "NombreComun", sortable: true, editable: true },
    { field: "NombreoCientifico", sortable: true, editable: true },
    { field: "descripcion", sortable: true, editable: true },
    { field: "imagen" ,sortable: true, editable: true },
    { field: "creador", sortable: true,},
    { field: "FechaCreacion", sortable: true },
  ];

  defaultColDef: ColDef = {
    flex: 1,
  };
}
