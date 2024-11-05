/* import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import * as bootstrap from 'bootstrap';



@Component({
  selector: 'app-panel-de-mando',
  templateUrl: './panel-de-mando.component.html',
  styleUrls: ['./panel-de-mando.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PanelDeMandoComponent implements OnInit {
  collections = ['encuesta-compromiso-empleados', 'registro-usuarios-telemedicina']; //Aqui vas a actuallizar la lista de colecciones, escribela tal cual lo haces en firebase
  selectedCollection = 'encuesta-compromiso-empleados';
  fechaInicio!: string;
  fechaFin!: string;
  filtrarNombre: string = ''; 

  encuestaRowData: any[] = [];
  telemedicinaRowData: any[] = [];


  selectedRowData: any = null;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.applyDateFilter();  
  }

  onCollectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCollection = selectElement.value;
    this.applyDateFilter();  
  }

  applyDateFilter(): void {
    const startDate = this.fechaInicio ? new Date(this.fechaInicio) : new Date(0);  
    const endDate = this.fechaFin ? this.adjustEndDate(new Date(this.fechaFin)) : new Date();  
    this.fetchData(this.selectedCollection, startDate, endDate); 
  }

  adjustEndDate(endDate: Date): Date {
    endDate.setDate(endDate.getDate() + 1); 
    return endDate;
  }

  fetchData(collection: string, startDate?: Date, endDate?: Date): void {
    if (collection === 'registro-usuarios-telemedicina') {
      this.firestoreService.getCollectionByDate(collection, startDate || new Date(0), endDate || new Date()).subscribe((data: any) => {
        const filteredData = this.filtrarNombre ? data.filter((doc: any) => doc.nombre?.toLowerCase().includes(this.filtrarNombre.toLowerCase())) : data;
        filteredData.forEach((doc: any) => {
          doc.cantidad_familiares = doc.familiares ? doc.familiares.length : 0;
          doc.f_creado = this.convertTimestampToDate(doc.f_creado);
        });
        this.telemedicinaRowData = filteredData;
      });
    } else if (collection === 'encuesta-compromiso-empleados') {
      this.firestoreService.getCollectionByDate(collection, startDate || new Date(0), endDate || new Date()).subscribe((data: any) => {
        const filteredData = this.filtrarNombre ? data.filter((doc: any) => doc.nombre?.toLowerCase().includes(this.filtrarNombre.toLowerCase())) : data;
        filteredData.forEach((doc: any) => {
          doc.f_creado = this.convertTimestampToDate(doc.f_creado); 
        });
        this.encuestaRowData = filteredData;
      });

    }
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
      ? this.prepareCompromisoData().filter(row => row.selected)  
      : this.prepareTelemedicinaData().filter(row => row.selected); 

  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    this.saveAsExcelFile(excelBuffer, `export_${this.selectedCollection}_${new Date().getTime()}`);

    
  }
  

  prepareCompromisoData(): any[] {
    return this.encuestaRowData.map((row: any) => {
      const promedio = this.calculateAverage([row.q1, row.q2, row.q3, row.q4, row.q5, row.q6, row.q7, row.q8, row.q9, row.q10, row.q11, row.q12]);
      
      return {
        ID: row.id,
        'Fecha Creación': row.f_creado,
        Antigüedad: row.antiguedad,
        Edad: row.edad,
        'Pregunta 1 - ¿Sabes lo que se espera de ti en tu trabajo?': row.q1,
        'Pregunta 1 - Interpretación': this.interpretValue(row.q1),
        'Pregunta 2 - ¿Tienes los materiales y equipo para hacer correctamente tu trabajo?': row.q2,
        'Pregunta 2 - Interpretación': this.interpretValue(row.q2),
        'Pregunta 3 - ¿Tienes la oportunidad de hacer lo que mejor sabes hacer cada día en el trabajo?': row.q3,
        'Pregunta 3 - Interpretación': this.interpretValue(row.q3),
        'Pregunta 4 - En los últimos 7 días ¿Has recibido reconocimiento o felicitaciones por hacer un buen trabajo?': row.q4,
        'Pregunta 4 - Interpretación': this.interpretValue(row.q4),
        'Pregunta 5 - ¿Sientes que tu supervisor o alguien se preocupa por ti como persona en el trabajo?': row.q5,
        'Pregunta 5 - Interpretación': this.interpretValue(row.q5),
        'Pregunta 6 - ¿Hay alguien que alienta tu desarrollo en el trabajo?': row.q6,
        'Pregunta 6 - Interpretación': this.interpretValue(row.q6),
        'Pregunta 7 - ¿Tus opiniones se toman en cuenta en el trabajo?': row.q7,
        'Pregunta 7 - Interpretación': this.interpretValue(row.q7),
        'Pregunta 8 - ¿La misión/propósito de tu empresa hace sentir que tu trabajo es importante?': row.q8,
        'Pregunta 8 - Interpretación': this.interpretValue(row.q8),
        'Pregunta 9 - ¿Tus compañeros de trabajo están comprometidos en hacer un trabajo de calidad?': row.q9,
        'Pregunta 9 - Interpretación': this.interpretValue(row.q9),
        'Pregunta 10 - ¿Tienes un mejor amigo en el trabajo?': row.q10,
        'Pregunta 10 - Interpretación': this.interpretValue(row.q10),
        'Pregunta 11 - En los últimos seis meses ¿alguien en el trabajo te ha hablado sobre su progreso?': row.q11,
        'Pregunta 11 - Interpretación': this.interpretValue(row.q11),
        'Pregunta 12 - En el último año ¿has tenido la oportunidad de aprender y crecer?': row.q12,
        'Pregunta 12 - Interpretación': this.interpretValue(row.q12),
        Promedio: promedio, 
        'Interpretación del Promedio': this.interpretValue(promedio),
        selected: row.selected 
      };
    });
  }

  prepareTelemedicinaData(): any[] {
    return this.telemedicinaRowData.map((row: any) => {
      const familiares = row.familiares || [];
      
      return {
        ID: row.id,
        'Fecha Creación': row.f_creado,
        Nombre: row.nombre,
        Correo: row.correo,
        Domicilio: row.domicilio,
        Edad: row.edad,
        Escolaridad: row.escolaridad,
        'Estado Civil': row.estado_civil,
        'Fecha Nacimiento': row.fecha_nacimiento,
        Género: row.genero,
        'Cantidad de Familiares': familiares.length,
        'Familiar 1 - Nombre': familiares[0]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 1 - género': familiares[0]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 1 - fecha de nacimiento': familiares[0]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 1 - Edad': familiares[0]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 1 - Domicilio': familiares[0]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 1 - Escolaridad': familiares[0]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 1 - Puesto': familiares[0]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 1 - Ocupación': familiares[0]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 1 - Parentesco': familiares[0]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 2 - Nombre': familiares[1]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 2 - género': familiares[1]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 2 - fecha de nacimiento': familiares[1]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 2 - Edad': familiares[1]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 2 - Domicilio': familiares[1]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 2 - Escolaridad': familiares[1]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 2 - Puesto': familiares[1]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 2 - Ocupación': familiares[1]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 2 - Parentesco': familiares[1]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 3 - Nombre': familiares[2]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 3 - género': familiares[2]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 3 - fecha de nacimiento': familiares[2]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 3 - Edad': familiares[2]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 3 - Domicilio': familiares[2]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 3 - Escolaridad': familiares[2]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 3 - Puesto': familiares[2]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 3 - Ocupación': familiares[2]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 3 - Parentesco': familiares[2]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 4 - Nombre': familiares[3]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 4 - género': familiares[3]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 4 - fecha de nacimiento': familiares[3]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 4 - Edad': familiares[3]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 4 - Domicilio': familiares[3]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 4 - Escolaridad': familiares[3]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 4 - Puesto': familiares[3]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 4 - Ocupación': familiares[3]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 4 - Parentesco': familiares[3]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 5 - Nombre': familiares[4]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 5 - género': familiares[4]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 5 - fecha de nacimiento': familiares[4]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 5 - Edad': familiares[4]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 5 - Domicilio': familiares[4]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 5 - Escolaridad': familiares[4]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 5 - Puesto': familiares[4]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 5 - Ocupación': familiares[4]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 5 - Parentesco': familiares[4]?.parentesco_familiar || 'Sin registrar familiar',
        selected: row.selected 


      };
    });
  }



  calculateAverage(values: string[]): number {
    const total = values.reduce((acc, val) => acc + parseFloat(val), 0);
    const average = total / values.length;
    return average;
  }

  saveAsExcelFile(buffer: any, filename: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, filename + EXCEL_EXTENSION);
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

  toggleAll(event: any, collection: string) {
    const checked = event.target.checked;


    if (collection === 'registro-usuarios-telemedicina') {
        this.telemedicinaRowData.forEach(data => {
            data.selected = checked;
        });
    } else if (collection === 'encuesta-compromiso-empleados') {
        this.encuestaRowData.forEach(data => {
            data.selected = checked;
        });

    }


    this.checkIfAnySelected();
}



isPrintButtonDisabled: boolean = true; 

updateSelection(row: any): void {
  row.selected = !row.selected; 
  this.updatePrintButtonState(); 
}

updatePrintButtonState(): void {

  this.isPrintButtonDisabled = !this.prepareCompromisoData().some(row => row.selected) && 
                               !this.prepareTelemedicinaData().some(row => row.selected);

}


checkIfAnySelected() {
  this.isPrintButtonDisabled = !this.encuestaRowData.some(data => data.selected);
}


onCheckboxChange() {
  this.checkIfAnySelected();
}


toggleCheckbox(data: any) {
  data.selected = !data.selected; 
  this.checkIfAnySelected(); 
}



  
}

 */

/* Funciona

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import * as bootstrap from 'bootstrap';



@Component({
  selector: 'app-panel-de-mando',
  templateUrl: './panel-de-mando.component.html',
  styleUrls: ['./panel-de-mando.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PanelDeMandoComponent implements OnInit {
  collections = ['encuesta-compromiso-empleados', 'registro-usuarios-telemedicina']; //Aqui vas a actuallizar la lista de colecciones, escribela tal cual lo haces en firebase
  selectedCollection = 'encuesta-compromiso-empleados';
  fechaInicio!: string;
  fechaFin!: string;
  filtrarNombre: string = ''; 

  encuestaRowData: any[] = [];
  telemedicinaRowData: any[] = [];
  selectedRecords: { [key: string]: boolean } = {}; // Estado global de selección
selectAllUsed: boolean = false; // Estado para identificar si se usó "Seleccionar Todos"



  selectedRowData: any = null;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.applyDateFilter();  
  }

  onCollectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCollection = selectElement.value;
    this.applyDateFilter();  
  }

  applyDateFilter(): void {
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
      ? this.prepareCompromisoData().filter(row => row.selected)  
      : this.prepareTelemedicinaData().filter(row => row.selected); 

  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    this.saveAsExcelFile(excelBuffer, `export_${this.selectedCollection}_${new Date().getTime()}`);

    
  }
  

  prepareCompromisoData(): any[] {
    return this.encuestaRowData.map((row: any) => {
      const promedio = this.calculateAverage([row.q1, row.q2, row.q3, row.q4, row.q5, row.q6, row.q7, row.q8, row.q9, row.q10, row.q11, row.q12]);
      
      return {
        ID: row.id,
        'Fecha Creación': row.f_creado,
        Antigüedad: row.antiguedad,
        Edad: row.edad,
        'Pregunta 1 - ¿Sabes lo que se espera de ti en tu trabajo?': row.q1,
        'Pregunta 1 - Interpretación': this.interpretValue(row.q1),
        'Pregunta 2 - ¿Tienes los materiales y equipo para hacer correctamente tu trabajo?': row.q2,
        'Pregunta 2 - Interpretación': this.interpretValue(row.q2),
        'Pregunta 3 - ¿Tienes la oportunidad de hacer lo que mejor sabes hacer cada día en el trabajo?': row.q3,
        'Pregunta 3 - Interpretación': this.interpretValue(row.q3),
        'Pregunta 4 - En los últimos 7 días ¿Has recibido reconocimiento o felicitaciones por hacer un buen trabajo?': row.q4,
        'Pregunta 4 - Interpretación': this.interpretValue(row.q4),
        'Pregunta 5 - ¿Sientes que tu supervisor o alguien se preocupa por ti como persona en el trabajo?': row.q5,
        'Pregunta 5 - Interpretación': this.interpretValue(row.q5),
        'Pregunta 6 - ¿Hay alguien que alienta tu desarrollo en el trabajo?': row.q6,
        'Pregunta 6 - Interpretación': this.interpretValue(row.q6),
        'Pregunta 7 - ¿Tus opiniones se toman en cuenta en el trabajo?': row.q7,
        'Pregunta 7 - Interpretación': this.interpretValue(row.q7),
        'Pregunta 8 - ¿La misión/propósito de tu empresa hace sentir que tu trabajo es importante?': row.q8,
        'Pregunta 8 - Interpretación': this.interpretValue(row.q8),
        'Pregunta 9 - ¿Tus compañeros de trabajo están comprometidos en hacer un trabajo de calidad?': row.q9,
        'Pregunta 9 - Interpretación': this.interpretValue(row.q9),
        'Pregunta 10 - ¿Tienes un mejor amigo en el trabajo?': row.q10,
        'Pregunta 10 - Interpretación': this.interpretValue(row.q10),
        'Pregunta 11 - En los últimos seis meses ¿alguien en el trabajo te ha hablado sobre su progreso?': row.q11,
        'Pregunta 11 - Interpretación': this.interpretValue(row.q11),
        'Pregunta 12 - En el último año ¿has tenido la oportunidad de aprender y crecer?': row.q12,
        'Pregunta 12 - Interpretación': this.interpretValue(row.q12),
        Promedio: promedio, 
        'Interpretación del Promedio': this.interpretValue(promedio),
        selected: row.selected 
      };
    });
  }

  prepareTelemedicinaData(): any[] {
    return this.telemedicinaRowData.map((row: any) => {
      const familiares = row.familiares || [];
      
      return {
        ID: row.id,
        'Fecha Creación': row.f_creado,
        Nombre: row.nombre,
        Correo: row.correo,
        Domicilio: row.domicilio,
        Edad: row.edad,
        Escolaridad: row.escolaridad,
        'Estado Civil': row.estado_civil,
        'Fecha Nacimiento': row.fecha_nacimiento,
        Género: row.genero,
        'Cantidad de Familiares': familiares.length,
        'Familiar 1 - Nombre': familiares[0]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 1 - género': familiares[0]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 1 - fecha de nacimiento': familiares[0]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 1 - Edad': familiares[0]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 1 - Domicilio': familiares[0]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 1 - Escolaridad': familiares[0]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 1 - Puesto': familiares[0]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 1 - Ocupación': familiares[0]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 1 - Parentesco': familiares[0]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 2 - Nombre': familiares[1]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 2 - género': familiares[1]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 2 - fecha de nacimiento': familiares[1]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 2 - Edad': familiares[1]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 2 - Domicilio': familiares[1]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 2 - Escolaridad': familiares[1]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 2 - Puesto': familiares[1]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 2 - Ocupación': familiares[1]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 2 - Parentesco': familiares[1]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 3 - Nombre': familiares[2]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 3 - género': familiares[2]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 3 - fecha de nacimiento': familiares[2]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 3 - Edad': familiares[2]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 3 - Domicilio': familiares[2]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 3 - Escolaridad': familiares[2]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 3 - Puesto': familiares[2]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 3 - Ocupación': familiares[2]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 3 - Parentesco': familiares[2]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 4 - Nombre': familiares[3]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 4 - género': familiares[3]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 4 - fecha de nacimiento': familiares[3]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 4 - Edad': familiares[3]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 4 - Domicilio': familiares[3]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 4 - Escolaridad': familiares[3]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 4 - Puesto': familiares[3]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 4 - Ocupación': familiares[3]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 4 - Parentesco': familiares[3]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 5 - Nombre': familiares[4]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 5 - género': familiares[4]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 5 - fecha de nacimiento': familiares[4]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 5 - Edad': familiares[4]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 5 - Domicilio': familiares[4]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 5 - Escolaridad': familiares[4]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 5 - Puesto': familiares[4]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 5 - Ocupación': familiares[4]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 5 - Parentesco': familiares[4]?.parentesco_familiar || 'Sin registrar familiar',
        selected: row.selected 


      };
    });
  }



  calculateAverage(values: string[]): number {
    const total = values.reduce((acc, val) => acc + parseFloat(val), 0);
    const average = total / values.length;
    return average;
  }

  saveAsExcelFile(buffer: any, filename: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, filename + EXCEL_EXTENSION);
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
  
    this.updatePrintButtonState(); // Actualizar el botón de imprimir
  }
  
  



isPrintButtonDisabled: boolean = true; 

updateSelection(row: any): void {
  row.selected = !row.selected; // Alternar selección

  if (row.selected) {
    this.selectedRecords[row.id] = true; // Guardar en el estado global
  } else {
    delete this.selectedRecords[row.id]; // Eliminar del estado global
  }

  this.updatePrintButtonState(); // Actualizar el botón de imprimir
}



updatePrintButtonState(): void {
  this.checkIfAnySelected(); // Reutiliza la lógica de selección
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

*/

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import * as bootstrap from 'bootstrap';



@Component({
  selector: 'app-panel-de-mando',
  templateUrl: './panel-de-mando.component.html',
  styleUrls: ['./panel-de-mando.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PanelDeMandoComponent implements OnInit {
  collections = ['encuesta-compromiso-empleados', 'registro-usuarios-telemedicina']; //Aqui vas a actuallizar la lista de colecciones, escribela tal cual lo haces en firebase
  selectedCollection = 'encuesta-compromiso-empleados';
  fechaInicio!: string;
  fechaFin!: string;
  filtrarNombre: string = '';

  encuestaRowData: any[] = [];
  telemedicinaRowData: any[] = [];
  selectedRecords: { [key: string]: boolean } = {}; // Estado global de selección
  selectAllUsed: boolean = false; // Estado para identificar si se usó "Seleccionar Todos"



  selectedRowData: any = null;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.applyDateFilter();
  }

  onCollectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCollection = selectElement.value;
    this.applyDateFilter();
  }

  applyDateFilter(): void {
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
      ? this.prepareCompromisoData().filter(row => row.selected)
      : this.prepareTelemedicinaData().filter(row => row.selected);


    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, `export_${this.selectedCollection}_${new Date().getTime()}`);


  }


  prepareCompromisoData(): any[] {
    return this.encuestaRowData.map((row: any) => {
      const promedio = this.calculateAverage([row.q1, row.q2, row.q3, row.q4, row.q5, row.q6, row.q7, row.q8, row.q9, row.q10, row.q11, row.q12]);

      return {
        ID: row.id,
        'Fecha Creación': row.f_creado,
        Antigüedad: row.antiguedad,
        Edad: row.edad,
        'Pregunta 1 - ¿Sabes lo que se espera de ti en tu trabajo?': row.q1,
        'Pregunta 1 - Interpretación': this.interpretValue(row.q1),
        'Pregunta 2 - ¿Tienes los materiales y equipo para hacer correctamente tu trabajo?': row.q2,
        'Pregunta 2 - Interpretación': this.interpretValue(row.q2),
        'Pregunta 3 - ¿Tienes la oportunidad de hacer lo que mejor sabes hacer cada día en el trabajo?': row.q3,
        'Pregunta 3 - Interpretación': this.interpretValue(row.q3),
        'Pregunta 4 - En los últimos 7 días ¿Has recibido reconocimiento o felicitaciones por hacer un buen trabajo?': row.q4,
        'Pregunta 4 - Interpretación': this.interpretValue(row.q4),
        'Pregunta 5 - ¿Sientes que tu supervisor o alguien se preocupa por ti como persona en el trabajo?': row.q5,
        'Pregunta 5 - Interpretación': this.interpretValue(row.q5),
        'Pregunta 6 - ¿Hay alguien que alienta tu desarrollo en el trabajo?': row.q6,
        'Pregunta 6 - Interpretación': this.interpretValue(row.q6),
        'Pregunta 7 - ¿Tus opiniones se toman en cuenta en el trabajo?': row.q7,
        'Pregunta 7 - Interpretación': this.interpretValue(row.q7),
        'Pregunta 8 - ¿La misión/propósito de tu empresa hace sentir que tu trabajo es importante?': row.q8,
        'Pregunta 8 - Interpretación': this.interpretValue(row.q8),
        'Pregunta 9 - ¿Tus compañeros de trabajo están comprometidos en hacer un trabajo de calidad?': row.q9,
        'Pregunta 9 - Interpretación': this.interpretValue(row.q9),
        'Pregunta 10 - ¿Tienes un mejor amigo en el trabajo?': row.q10,
        'Pregunta 10 - Interpretación': this.interpretValue(row.q10),
        'Pregunta 11 - En los últimos seis meses ¿alguien en el trabajo te ha hablado sobre su progreso?': row.q11,
        'Pregunta 11 - Interpretación': this.interpretValue(row.q11),
        'Pregunta 12 - En el último año ¿has tenido la oportunidad de aprender y crecer?': row.q12,
        'Pregunta 12 - Interpretación': this.interpretValue(row.q12),
        Promedio: promedio,
        'Interpretación del Promedio': this.interpretValue(promedio),
        selected: row.selected
      };
    });
  }

  prepareTelemedicinaData(): any[] {
    return this.telemedicinaRowData.map((row: any) => {
      const familiares = row.familiares || [];

      return {
        ID: row.id,
        'Fecha Creación': row.f_creado,
        Nombre: row.nombre,
        Correo: row.correo,
        Domicilio: row.domicilio,
        Edad: row.edad,
        Escolaridad: row.escolaridad,
        'Estado Civil': row.estado_civil,
        'Fecha Nacimiento': row.fecha_nacimiento,
        Género: row.genero,
        'Cantidad de Familiares': familiares.length,
        'Familiar 1 - Nombre': familiares[0]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 1 - género': familiares[0]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 1 - fecha de nacimiento': familiares[0]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 1 - Edad': familiares[0]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 1 - Domicilio': familiares[0]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 1 - Escolaridad': familiares[0]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 1 - Puesto': familiares[0]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 1 - Ocupación': familiares[0]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 1 - Parentesco': familiares[0]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 2 - Nombre': familiares[1]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 2 - género': familiares[1]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 2 - fecha de nacimiento': familiares[1]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 2 - Edad': familiares[1]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 2 - Domicilio': familiares[1]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 2 - Escolaridad': familiares[1]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 2 - Puesto': familiares[1]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 2 - Ocupación': familiares[1]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 2 - Parentesco': familiares[1]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 3 - Nombre': familiares[2]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 3 - género': familiares[2]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 3 - fecha de nacimiento': familiares[2]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 3 - Edad': familiares[2]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 3 - Domicilio': familiares[2]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 3 - Escolaridad': familiares[2]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 3 - Puesto': familiares[2]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 3 - Ocupación': familiares[2]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 3 - Parentesco': familiares[2]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 4 - Nombre': familiares[3]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 4 - género': familiares[3]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 4 - fecha de nacimiento': familiares[3]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 4 - Edad': familiares[3]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 4 - Domicilio': familiares[3]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 4 - Escolaridad': familiares[3]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 4 - Puesto': familiares[3]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 4 - Ocupación': familiares[3]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 4 - Parentesco': familiares[3]?.parentesco_familiar || 'Sin registrar familiar',

        'Familiar 5 - Nombre': familiares[4]?.nombre_familiar || 'Sin registrar familiar',
        'Familiar 5 - género': familiares[4]?.genero_familiar || 'Sin registrar familiar',
        'Familiar 5 - fecha de nacimiento': familiares[4]?.fecha_nacimiento_familiar || 'Sin registrar familiar',
        'Familiar 5 - Edad': familiares[4]?.edad_familiar || 'Sin registrar familiar',
        'Familiar 5 - Domicilio': familiares[4]?.domicilio_familiar || 'Sin registrar familiar',
        'Familiar 5 - Escolaridad': familiares[4]?.escolaridad_familiar || 'Sin registrar familiar',
        'Familiar 5 - Puesto': familiares[4]?.puesto_familiar || 'Sin registrar familiar',
        'Familiar 5 - Ocupación': familiares[4]?.ocupacion_familiar || 'Sin registrar familiar',
        'Familiar 5 - Parentesco': familiares[4]?.parentesco_familiar || 'Sin registrar familiar',
        selected: row.selected


      };
    });
  }



  calculateAverage(values: string[]): number {
    const total = values.reduce((acc, val) => acc + parseFloat(val), 0);
    const average = total / values.length;
    return average;
  }

  saveAsExcelFile(buffer: any, filename: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, filename + EXCEL_EXTENSION);
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
  




  isPrintButtonDisabled: boolean = true;

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