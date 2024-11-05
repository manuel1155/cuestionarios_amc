import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Cuestionario2Component } from './cuestionario2/cuestionario2.component';
import { GraciasComponent } from './gracias/gracias.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { RegistroTelemedicinaComponent } from './registro-telemedicina/registro-telemedicina.component';
import { GraciasTelemedicinaComponent } from './gracias-telemedicina/gracias-telemedicina.component';
import { PanelDeMandoComponent } from './panel-de-mando/panel-de-mando.component';

export const routes: Routes = [
  { path: 'compromiso_empleado', component: Cuestionario2Component },
  { path: 'gracias_compromiso', component: GraciasComponent },
  { path: '', redirectTo: '/compromiso_empleado', pathMatch: 'full' }, // Redirige a cuestionario por defecto
  { path: 'registro_telemedicina', component: RegistroTelemedicinaComponent },
  { path: 'gracias_telemedicina', component: GraciasTelemedicinaComponent },
  { path: 'panel-de-mando', component: PanelDeMandoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),TooltipModule.forRoot()],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export class AppModule {}


