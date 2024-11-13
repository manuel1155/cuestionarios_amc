import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelTelemedicinaService {

  constructor() { }

  generarExcelConFamiliares(datos: any[]) {
    const wb = XLSX.utils.book_new();
    // Crear hoja "Empleado"
    const empleadoData = [
      ["Fecha de Ingreso", "Escolaridad", "Correo", "CURP", "Fecha de Nacimiento", "Género", "Edad", "Nombre", "Fecha Creado", "Domicilio", "Teléfono", "Estado Civil", "Preferencia de Contacto", "Enfermedades Crónicas", "Tipo de Enfermedad Crónica", "Puesto"]
    ];
    datos.forEach((empleado: any) => {
      empleadoData.push([
        empleado.fecha_ingreso,
        empleado.escolaridad,
        empleado.correo,
        empleado.curp,
        empleado.fecha_nacimiento,
        empleado.genero,
        empleado.edad,
        empleado.nombre,
        empleado.f_creado,
        empleado.domicilio,
        empleado.telefono,
        empleado.estado_civil,
        empleado.preferencia_contacto,
        empleado.enfe_cronicas,
        empleado.tipo_enfermedad_cronica,
        empleado.puesto,
        // Agregar más campos según sea necesario
      ]);
    });
    const wsEmpleado = XLSX.utils.aoa_to_sheet(empleadoData);
    XLSX.utils.book_append_sheet(wb, wsEmpleado, "Empleado");

    // Crear hoja "Familiares"
    const familiaresData = [
      ["CURP del Empleado", "Nombre del Familiar", "Parentesco", "Edad", "Género", "CURP Familiar", "Puesto Familiar", "Escolaridad Familiar", "Ocupación Familiar", "Domicilio Familiar", "Fecha de Nacimiento Familiar"]
    ];
    datos.forEach((empleado: any) => {
      if (empleado.familiares && Array.isArray(empleado.familiares)) {
        empleado.familiares.forEach((familiar: any) => {
          familiaresData.push([
            empleado.curp,
            familiar.nombre_familiar,
            familiar.parentesco_familiar,
            familiar.edad_familiar,
            familiar.genero_familiar,
            familiar.curp_fam,
            familiar.puesto_familiar,
            familiar.escolaridad_familiar,
            familiar.ocupacion_familiar,
            familiar.domicilio_familiar,
            familiar.fecha_nacimiento_familiar,
            // Agregar más campos según sea necesario
          ]);
        });
      }
    });
    const wsFamiliares = XLSX.utils.aoa_to_sheet(familiaresData);
    XLSX.utils.book_append_sheet(wb, wsFamiliares, "Familiares");

    // Generar archivo Excel
    XLSX.writeFile(wb, 'Empleados_Familiares.xlsx');
  }

  generarExcelConCompromiso(datos: any[]): void {
    const wb = XLSX.utils.book_new();

    const compromisoData = [
      ["ID", "Fecha Creación", "Antigüedad", "Edad", "Pregunta 1", "Interpretación 1", "Pregunta 2", "Interpretación 2", "Pregunta 3", "Interpretación 3", "Pregunta 4", "Interpretación 4", "Pregunta 5", "Interpretación 5", "Pregunta 6", "Interpretación 6", "Pregunta 7", "Interpretación 7", "Pregunta 8", "Interpretación 8", "Pregunta 9", "Interpretación 9", "Pregunta 10", "Interpretación 10", "Pregunta 11", "Interpretación 11", "Pregunta 12", "Interpretación 12", "Promedio", "Interpretación del Promedio"]
    ];

    datos.forEach((row: any) => {
      const promedio = this.calculateAverage([row.q1, row.q2, row.q3, row.q4, row.q5, row.q6, row.q7, row.q8, row.q9, row.q10, row.q11, row.q12]);

      compromisoData.push([
        row.id,
        row.f_creado,
        row.antiguedad,
        row.edad,
        row.q1,
        this.interpretValue(row.q1),
        row.q2,
        this.interpretValue(row.q2),
        row.q3,
        this.interpretValue(row.q3),
        row.q4,
        this.interpretValue(row.q4),
        row.q5,
        this.interpretValue(row.q5),
        row.q6,
        this.interpretValue(row.q6),
        row.q7,
        this.interpretValue(row.q7),
        row.q8,
        this.interpretValue(row.q8),
        row.q9,
        this.interpretValue(row.q9),
        row.q10,
        this.interpretValue(row.q10),
        row.q11,
        this.interpretValue(row.q11),
        row.q12,
        this.interpretValue(row.q12),
        promedio,
        this.interpretValue(promedio)
      ]);
    });

    const wsCompromiso = XLSX.utils.aoa_to_sheet(compromisoData);
    XLSX.utils.book_append_sheet(wb, wsCompromiso, "Compromiso");

    XLSX.writeFile(wb, 'Compromiso_Empleados.xlsx');
  }

  calculateAverage(values: string[]): number {
    const total = values.reduce((acc, val) => acc + parseFloat(val), 0);
    const average = total / values.length;
    return average;
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

}
