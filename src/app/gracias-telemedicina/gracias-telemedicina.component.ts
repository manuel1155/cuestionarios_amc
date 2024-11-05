import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gracias-telemedicina',
  standalone: true,
  imports: [],
  templateUrl: './gracias-telemedicina.component.html',
  styleUrl: './gracias-telemedicina.component.css'
})
export class GraciasTelemedicinaComponent {
  constructor(private router: Router) { }

  ngOnInit(): void {
    const formSubmitted = localStorage.getItem('formSubmitted');
    if (!formSubmitted) {
      this.router.navigate(['/cuestionario2']);
    }
  }

}
