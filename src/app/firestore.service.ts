import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) {}


  listenToCollection(collectionName: string): Observable<any[]> {
    return new Observable((observer) => {
      const subscription = this.firestore.collection(collectionName)
        .snapshotChanges()
        .subscribe(snapshot => {
          const data = snapshot.map(doc => ({
            id: doc.payload.doc.id,
            ...doc.payload.doc.data() as any
          }));
          observer.next(data);  
        });


      return () => subscription.unsubscribe();
    });
  }


  saveFormData(data: any, collectionName: string): Promise<void> {
    const id = this.firestore.createId();
    data.id = id;
    data.f_creado = new Date(); 
    return this.firestore.collection(collectionName).doc(id).set(data);
  }


  getCollectionByDate(collectionName: string, startDate: Date, endDate: Date): Observable<any[]> {
    return this.firestore.collection(collectionName, ref => 
      ref.where('f_creado', '>=', startDate)
         .where('f_creado', '<=', endDate)
    ).valueChanges();
  }
}
