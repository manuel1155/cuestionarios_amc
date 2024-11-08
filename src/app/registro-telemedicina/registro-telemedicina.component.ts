import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TelemedicinaService } from '../services/telemedicina/telemedicina-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-telemedicina',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './registro-telemedicina.component.html',
  styleUrls: ['./registro-telemedicina.component.css']
})
export class RegistroTelemedicinaComponent implements OnInit {
  encuestaForm: FormGroup;
  buttonClass: string = 'btn btn-success btn-lg custom-btn-activado';
  curpValidada: boolean = false;
  curpExiste: boolean = false;
  validCURP: boolean = false;
  buttonDisabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private telemedicinaService: TelemedicinaService,
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
      familiares: this.fb.array([]),
      curp: ['', [Validators.required, Validators.pattern(/^([A-Z]{4}\d{6}[HM][A-Z]{5}\d{2})$/)]],// Añadir campo CURP
      enfe_cronicas: [ '', Validators.required ],
      tipo_enfermedad_cronica: [ '', Validators.required ],
    });
  }

  get f() { return this.encuestaForm.controls; }

  get familiares(): FormArray {
    return this.encuestaForm.get('familiares') as FormArray;
  }

  async onKeydownCURP(event: KeyboardEvent) {
    const campo = (event.target as HTMLInputElement).attributes.getNamedItem('formcontrolname')?.value;
    if (!campo) return;
    let value: string = this.encuestaForm.controls[campo].value;
    value = value.toUpperCase();
    this.encuestaForm.controls[campo].setValue(value);
    const pacCurpControl = this.encuestaForm.get('curp');
    if (value.length >= 18 && pacCurpControl && pacCurpControl.valid) {
      this.validCURP = true;
    }
  }

  async onKeydownCURPFamiliar(event: KeyboardEvent, index: number) {
    const campo = (event.target as HTMLInputElement).attributes.getNamedItem('formcontrolname')?.value;
    if (!campo) return;
    let value: string = this.familiares.at(index).get(campo)?.value;
    value = value.toUpperCase();
    this.familiares.at(index).get(campo)?.setValue(value);
    const famCurpControl = this.familiares.at(index).get('curp_fam');
    if (value.length >= 18 && famCurpControl && famCurpControl.valid) {
      this.validCURP = true;
    }
  }

  agregarFamiliar(): void {
    if (this.familiares.length < 5) {
      const index = this.familiares.length;
      const familiarGroup = this.fb.group({
        curp_fam: ['', [Validators.required, Validators.pattern(/^([A-Z]{4}\d{6}[HM][A-Z]{5}\d{2})$/)]],
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

  validarCurp(): void {
    const curp = this.encuestaForm.get('curp')?.value;
    if (curp) {
      this.telemedicinaService.checkCurpExists(curp).subscribe(exists => {
        this.curpValidada = true;
        this.curpExiste = exists;
        if (exists) {
          this.encuestaForm.get('curp')?.reset();
          this.buttonDisabled = false;
        } else {
          this.curpValidada = true;
          this.buttonDisabled = true;
        }
      });
    }
  }

  onEnfermedadCronicaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(`Enfermedad crónica changed to: ${input.value}`);
    const tipoEnfermedadControl = this.encuestaForm.get('tipo_enfermedad_cronica');
    if (input.value.toLowerCase() === 'no') {
      tipoEnfermedadControl?.clearValidators();
      tipoEnfermedadControl?.setValue('');
    } else {
      tipoEnfermedadControl?.setValidators([Validators.required]);
    }
    tipoEnfermedadControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.encuestaForm.valid && this.familiares.controls.every(f => f.valid)) {
      const curp = this.encuestaForm.get('curp')?.value;
      this.buttonDisabled = true; // Disable the button to prevent multiple submissions
      this.telemedicinaService.checkCurpExists(curp).subscribe(exists => {
        if (!exists) {
          const formData = {
            ...this.encuestaForm.value,
            f_creado: new Date() // Add creation date
          };
          this.telemedicinaService.saveForm(formData).then(() => {
            localStorage.setItem('formSubmitted', 'true');
            this.router.navigate(['/gracias_telemedicina']);
          }).catch(error => {
            console.error("Error guardando datos en Firestore", error);
            this.buttonDisabled = false; // Re-enable the button in case of error
          });
        } else {
          console.log("La CURP ya está registrada");
          this.buttonDisabled = false; // Re-enable the button if CURP exists
        }
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
