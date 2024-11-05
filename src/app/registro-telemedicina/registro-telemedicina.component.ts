import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 


@Component({
  selector: 'app-registro-telemedicina',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './registro-telemedicina.component.html',
  styleUrl: './registro-telemedicina.component.css'
})
export class RegistroTelemedicinaComponent  implements OnInit{
  encuestaForm: FormGroup;
  buttonClass: string = 'btn btn-success btn-lg custom-btn-activado';

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      genero: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      fecha_ingreso: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(17)]],
      domicilio: ['', Validators.required],
      escolaridad: ['', Validators.required],
      estado_civil: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      puesto: ['', Validators.required],
      preferencia_contacto: ['', Validators.required],
      familiares: this.fb.array([]) 
    });

    this.setupFieldListeners();
    this.encuestaForm.valueChanges.subscribe(() => {
      this.updateButtonClass();
    });
  }


  get familiares(): FormArray {
    return this.encuestaForm.get('familiares') as FormArray;
  }


  agregarFamiliar(): void {
    if (this.familiares.length < 5) {
      const index = this.familiares.length;
      const familiarGroup = this.fb.group({
        nombre_familiar: ['', Validators.required],
        genero_familiar: ['', Validators.required],
        fecha_nacimiento_familiar: ['', Validators.required],
        edad_familiar: ['', [Validators.required]],
        domicilio_familiar: ['', Validators.required],
        escolaridad_familiar: ['', Validators.required],
        puesto_familiar: ['', Validators.required],
        ocupacion_familiar: ['', Validators.required],
        parentesco_familiar: ['', Validators.required]
      });

      this.familiares.push(familiarGroup);
    }
  }
  

  eliminarFamiliar(index: number): void {
    if (index > -1) {
      this.familiares.removeAt(index);
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem('formSubmitted')) {
      this.router.navigate(['/gracias_telemedicina']);
    }
  }

  setupFieldListeners(): void {
    Object.keys(this.encuestaForm.controls).forEach(name => {
      this.encuestaForm.get(name)?.valueChanges.subscribe(() => {
        this.checkFieldValidity(name);
      });
    });
  }

  checkFieldValidity(fieldName: string): void {
    const control = this.encuestaForm.get(fieldName);
    const fieldElement = document.querySelector(`[formControlName="${fieldName}"]`) as HTMLElement;
    const tooltip = document.getElementById(`tooltip-${fieldName}`);

    if (control && fieldElement) {
      if (control.invalid && control.touched) {
        this.handleInvalidField(control, fieldElement, tooltip);
      } else {
        this.clearInvalidField(fieldElement, tooltip);
      }
    }

    this.updateButtonClass();
  }

  handleInvalidField(control: any, fieldElement: HTMLElement, tooltip: HTMLElement | null): void {
    if (control.errors?.min) {
      control.setErrors({ notEligible: true });
      this.showTooltip(tooltip, "Debes tener al menos 17 años de edad", fieldElement);
    } else {
      this.showTooltip(tooltip, "Favor de responder", fieldElement);
    }
  }

  showTooltip(tooltip: HTMLElement | null, message: string, fieldElement: HTMLElement): void {
    if (tooltip) {
      tooltip.textContent = message;
      tooltip.classList.add('show');
    }
    fieldElement.classList.add('is-invalid');
  }

  clearInvalidField(fieldElement: HTMLElement, tooltip: HTMLElement | null): void {
    fieldElement.classList.remove('is-invalid');
    if (tooltip) {
      tooltip.classList.remove('show');
    }
  }

  updateButtonClass(): void {
    this.buttonClass = this.encuestaForm.valid && this.familiares.controls.every(f => f.valid) 
      ? 'btn btn-success btn-lg custom-btn-activado' 
      : 'btn btn-danger btn-lg custom-btn-desactivado';
  }

/*   onSubmit(): void {
    if (this.encuestaForm.valid && this.familiares.controls.every(f => f.valid)) {
      console.log("Formulario válido", this.encuestaForm.value);
      this.firestoreService.saveFormData(this.encuestaForm.value)
        .then(() => {
          console.log("Datos guardados en Firestore");
          localStorage.setItem('formSubmitted', 'true');
          this.router.navigate(['/gracias_telemedicina']);
        })
        .catch(error => {
          console.error("Error guardando datos en Firestore", error);
        });
    } else {
      console.log("Formulario inválido");
      this.highlightInvalidFields();
    }
  } */

    onSubmit(): void {
      if (this.encuestaForm.valid && this.familiares.controls.every(f => f.valid)) {
        console.log("Formulario válido", this.encuestaForm.value);
        this.firestoreService.saveFormData(this.encuestaForm.value, 'registro-usuarios-telemedicina') // Guardar en la colección específica
          .then(() => {
            console.log("Datos guardados en Firestore");
            localStorage.setItem('formSubmitted', 'true');
            this.router.navigate(['/gracias_telemedicina']);
          })
          .catch(error => {
            console.error("Error guardando datos en Firestore", error);
          });
      } else {
        console.log("Formulario inválido");
        this.highlightInvalidFields();
      }
    }
    

  highlightInvalidFields(): void {
    const controls = this.encuestaForm.controls;
    let firstInvalidControl: HTMLElement | null = null;
  
    // Resaltar campos del formulario principal
    for (const name in controls) {
      if (controls.hasOwnProperty(name) && controls[name].invalid) {
        const invalidControl = document.querySelector(`[formControlName="${name}"]`) as HTMLElement;
        const tooltip = document.getElementById(`tooltip-${name}`);
  
        if (invalidControl) {
          if (tooltip) {
            tooltip.classList.add('show');
          }
  
          invalidControl.classList.add('is-invalid');
  
          if (!firstInvalidControl) {
            firstInvalidControl = invalidControl;
          }
        }
      }
    }
  

    this.familiares.controls.forEach((control, index: number) => {
      const group = control as FormGroup;
  
      Object.keys(group.controls).forEach(fieldName => {
        const fieldControl = group.get(fieldName);
        const invalidControl = document.getElementById(`familiar-${index}-${fieldName}`) as HTMLElement;
        const tooltip = document.getElementById(`tooltip-familiar-${index}-${fieldName}`);
  
        if (fieldControl && fieldControl.invalid && invalidControl) {
          if (tooltip) {
            tooltip.classList.add('show');
          }
  
          invalidControl.classList.add('is-invalid');
  
          if (!firstInvalidControl) {
            firstInvalidControl = invalidControl;
          }
        }
      });
    });
  
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

}
