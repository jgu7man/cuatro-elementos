import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { TableModel } from '../components/table/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  current$!:Observable<TableModel | undefined>;

  constructor (
    private _afs: AngularFirestore
  ) { }

  initTable(tid: string) {
    return this.current$ = this._afs.doc<TableModel>( `tables/${ tid }` )
      .valueChanges()
      .pipe(
        map( table => {
          if ( table ) return table
          else throw {code: 'table/not-found'}
        } ),
        catchError( this._handleError)
      )
  }

  private _handleError( error: any ) {
    if ( error.code && error.code === 'table/not-found' ) {
      Swal.fire( {
        icon: 'warning',
        title: 'Mesa no encontrada',
        text: '¡Ups! Disculpa, no pudimos encontrar la mesa que buscas. Tal vez quieras revisar bien el código o crear una nueva 😊. '
      })
    }
    return of(undefined)
  }
}
