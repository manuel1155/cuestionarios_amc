import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cuestionario',
  templateUrl: './cuestionario.component.html',
  styleUrls: ['./cuestionario.component.css'],
  imports: [ReactiveFormsModule, FormsModule, FormBuilder],standalone: true
})
export class CuestionarioComponent implements OnInit {
  encuestaForm: FormGroup;
  questions = [
    { label: '¿Sabes lo que se espera de ti en tu trabajo?' },
    { label: '¿Tienes los materiales y equipo para hacer correctamente tu trabajo?' },
    // Agrega aquí el resto de las preguntas
  ];

  constructor(private fb: FormBuilder) {
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
   }

  ngOnInit(): void {

  }

  onSubmit(): void {
    if (this.encuestaForm.valid) {
      // Manejar el envío del formulario
      console.log(this.encuestaForm.value);
      // Redirigir a otra página o mostrar un mensaje de éxito
    }
  }
}
