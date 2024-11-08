import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class TelemedicinaService {

  constructor(private firestore: AngularFirestore) { }

  // Método para verificar si la CURP existe en la base de datos
  checkCurpExists(curp: string): Observable<boolean> {
    return this.firestore.collection('registro-usuarios-telemedicina', ref => ref.where('curp', '==', curp))
      .snapshotChanges()
      .pipe(
        map(actions => actions.length > 0)
      );
  }

  // Método para guardar el formulario en la base de datos
  saveForm(formData: any): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('registro-usuarios-telemedicina').doc(id).set(formData);
  }
}
