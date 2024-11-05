import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuestionario2',
  templateUrl: './cuestionario2.component.html',
  styleUrls: ['./cuestionario2.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule] 
})
export class Cuestionario2Component implements OnInit{
  encuestaForm: FormGroup;
  buttonClass: string = 'btn btn-primary btn-lg';

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private router: Router 
  ) {
    this.encuestaForm = this.fb.group({
      antiguedad: ['', Validators.required],
      edad: ['', Validators.required],
      q1: ['', Validators.required],
      q2: ['', Validators.required],
      q3: ['', Validators.required],
      q4: ['', Validators.required],
      q5: ['', Validators.required],
      q6: ['', Validators.required],
      q7: ['', Validators.required],
      q8: ['', Validators.required],
      q9: ['', Validators.required],
      q10: ['', Validators.required],
      q11: ['', Validators.required],
      q12: ['', Validators.required]
    });

    this.setupFieldListeners();
    this.encuestaForm.valueChanges.subscribe(() => {
      this.updateButtonClass();
    });
  }

  setupFieldListeners(): void {
    const controls = this.encuestaForm.controls;
    for (const name in controls) {
      if (controls.hasOwnProperty(name)) {
        controls[name].valueChanges.subscribe(() => {
          this.checkFieldValidity(name);
        });
      }
    }
  }

  checkFieldValidity(fieldName: string): void {
    const control = this.encuestaForm.get(fieldName);
    const fieldElement = document.querySelector(`[formControlName="${fieldName}"]`);
    const tooltip = document.getElementById(`tooltip-${fieldName}`);

    if (control && fieldElement) {
      if (fieldName === 'edad' && control.value < 17) {
        control.setErrors({ notEligible: true });
        if (tooltip) {
          tooltip.textContent = "Debes tener al menos 17 años de edad";
          tooltip.classList.add('show');
        }
        fieldElement.classList.add('is-invalid');
      } else if (control.invalid && control.touched) {
        if (tooltip) {
          tooltip.textContent = "Favor de responder";
          tooltip.classList.add('show');
        }
        fieldElement.classList.add('is-invalid');
      } else {
        fieldElement.classList.remove('is-invalid');
        if (tooltip) {
          tooltip.classList.remove('show');
        }
      }
    }

    this.updateButtonClass();
  }

  updateButtonClass(): void {
    this.buttonClass = this.encuestaForm.valid ? 'btn btn-primary btn-lg' : 'btn btn-outline-danger btn-lg';
  }

  ngOnInit(): void {
    // Verificar si ya se ha enviado el formulario
    const formSubmitted = localStorage.getItem('formSubmitted');
    if (formSubmitted) {
      this.router.navigate(['/gracias_compromiso']);
    }
  }

/*   onSubmit(): void {
    if (this.encuestaForm.valid) {
      console.log("Formato valido");
      console.log(this.encuestaForm.value);
      this.firestoreService.saveFormData(this.encuestaForm.value).then(() => {
        console.log("Datos guardados en Firestore");
        localStorage.setItem('formSubmitted', 'true');
        this.router.navigate(['/gracias_compromiso']); // Redirige al usuario aquí
      }).catch(error => {
        console.error("Error guardando datos en Firestore", error);
      });
    } else {
      console.log("Formato invalido");
      this.highlightInvalidFields();
    }
  } */

    onSubmit(): void {
      if (this.encuestaForm.valid) {
        console.log("Formato valido");
        console.log(this.encuestaForm.value);
        this.firestoreService.saveFormData(this.encuestaForm.value, 'encuesta-compromiso-empleados')
          .then(() => {
            console.log("Datos guardados en Firestore");
            localStorage.setItem('formSubmitted', 'true');
            this.router.navigate(['/gracias_compromiso']);
          }).catch(error => {
            console.error("Error guardando datos en Firestore", error);
          });
      } else {
        console.log("Formato invalido");
        this.highlightInvalidFields();
      }
    }
    

  highlightInvalidFields(): void {
    const controls = this.encuestaForm.controls;
    let firstInvalidControl: HTMLElement | null = null;

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

    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
