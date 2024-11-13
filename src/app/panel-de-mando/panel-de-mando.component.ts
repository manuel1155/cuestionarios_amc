import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import * as bootstrap from 'bootstrap';
import { ExcelTelemedicinaService } from '../services/excel/excel-telemedicina.service';

@Component({
  selector: 'app-panel-de-mando',
  templateUrl: './panel-de-mando.component.html',
  styleUrls: ['./panel-de-mando.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PanelDeMandoComponent implements OnInit {
  collections = ['encuesta-compromiso-empleados', 'registro-usuarios-telemedicina'];
  selectedCollection = ''; // Inicialmente vacío
  fechaInicio!: string;
  fechaFin!: string;
  filtrarNombre: string = '';

  encuestaRowData: any[] = [];
  telemedicinaRowData: any[] = [];
  selectedRecords: { [key: string]: boolean } = {}; // Estado global de selección
  selectAllUsed: boolean = false; // Estado para identificar si se usó "Seleccionar Todos"
  selectedRowData: any = null;
  isPrintButtonDisabled: boolean = true;

  constructor(
    private firestoreService: FirestoreService,
    private excelTM: ExcelTelemedicinaService,
  ) { }

  ngOnInit(): void {
    // No aplicar filtro de fecha al inicio
  }

  onCollectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCollection = selectElement.value;
    this.applyDateFilter();
  }

  applyDateFilter(): void {
    if (!this.selectedCollection) return; // No hacer nada si no hay colección seleccionada
    const startDate = this.fechaInicio ? new Date(this.fechaInicio) : new Date(0);
    const endDate = this.fechaFin ? this.adjustEndDate(new Date(this.fechaFin)) : new Date();
    this.fetchData(this.selectedCollection, startDate, endDate);
  }

  adjustEndDate(endDate: Date): Date {
    endDate.setDate(endDate.getDate() + 1);
    return endDate;
  }

  fetchData(collection: string, startDate?: Date, endDate?: Date): void {
    this.firestoreService.getCollectionByDate(collection, startDate || new Date(0), endDate || new Date()).subscribe((data: any) => {
      const filteredData = this.filtrarNombre
        ? data.filter((doc: { nombre: string; }) => doc.nombre?.toLowerCase().includes(this.filtrarNombre.toLowerCase()))
        : data;

      filteredData.forEach((doc: { f_creado: string; }) => {
        doc.f_creado = this.convertTimestampToDate(doc.f_creado);
      });

      if (collection === 'registro-usuarios-telemedicina') {
        this.telemedicinaRowData = filteredData;
      } else if (collection === 'encuesta-compromiso-empleados') {
        this.encuestaRowData = filteredData;
      }
      this.syncSelectionWithGlobalState(filteredData); // Sincronizar con el estado global
    });
  }

  convertTimestampToDate(timestamp: any): string {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  interpretValue(value: string | number): string {
    const parsedValue = parseInt(value as string, 10);
    switch (parsedValue) {
      case 1:
        return 'Muy en desacuerdo';
      case 2:
        return 'En desacuerdo';
      case 3:
        return 'Neutral';
      case 4:
        return 'De acuerdo';
      case 5:
        return 'Muy de acuerdo';
      default:
        return 'Valor no válido';
    }
  }

  onNombreChange(): void {
    this.applyDateFilter();
  }

  exportExcel(): void {
    const dataToExport = this.selectedCollection === 'encuesta-compromiso-empleados'
      ? this.encuestaRowData.filter(row => row.selected)
      : this.telemedicinaRowData.filter(row => row.selected);

    if (this.selectedCollection === 'encuesta-compromiso-empleados') {
      this.excelTM.generarExcelConCompromiso(dataToExport);
    } else {
      this.excelTM.generarExcelConFamiliares(dataToExport);
    }
  }

  openModal(data: any): void {
    console.log('Data seleccionada:', data);
    this.selectedRowData = data;
    const modalElement = document.getElementById('infoModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  toggleAll(event: any, collection: string): void {
    const checked = event.target.checked;
    const data = collection === 'registro-usuarios-telemedicina'
      ? this.telemedicinaRowData
      : this.encuestaRowData;

    data.forEach(row => {
      row.selected = checked;
      if (checked) {
        this.selectedRecords[row.id] = true;
      } else {
        delete this.selectedRecords[row.id];
      }
    });

    this.selectAllUsed = checked; // Marcar que se usó "Seleccionar Todos"
    this.updatePrintButtonState(); // Actualizar el botón de imprimir
  }

  updateSelection(row: any): void {
    row.selected = !row.selected; // Alternar selección

    // Si no se está utilizando "Seleccionar Todos", no guardamos en el estado global
    if (this.selectAllUsed) {
      if (row.selected) {
        this.selectedRecords[row.id] = true;
      } else {
        delete this.selectedRecords[row.id];
      }
    }

    this.updatePrintButtonState(); // Actualizar el estado del botón de imprimir
  }

  updatePrintButtonState(): void {
    const anySelectedInEncuesta = this.encuestaRowData.some(row => row.selected);
    const anySelectedInTelemedicina = this.telemedicinaRowData.some(row => row.selected);

    const anyGlobalSelected = Object.keys(this.selectedRecords).length > 0;

    // El botón se activa si hay alguna selección, ya sea global o en la vista actual
    this.isPrintButtonDisabled = !(anySelectedInEncuesta || anySelectedInTelemedicina || anyGlobalSelected);
  }

  checkIfAnySelected(): void {
    const anySelectedInEncuesta = this.encuestaRowData.some(row => row.selected);
    const anySelectedInTelemedicina = this.telemedicinaRowData.some(row => row.selected);

    this.isPrintButtonDisabled = !(anySelectedInEncuesta || anySelectedInTelemedicina);
  }

  onCheckboxChange() {
    this.checkIfAnySelected();
  }

  toggleCheckbox(data: any) {
    data.selected = !data.selected;
    this.checkIfAnySelected();
  }

  syncSelectionWithGlobalState(data: any[]): void {
    data.forEach(row => {
      row.selected = !!this.selectedRecords[row.id]; // Sincronizar con el estado global
    });

    this.updatePrintButtonState(); // Asegurar que el botón esté en el estado correcto
  }

}
