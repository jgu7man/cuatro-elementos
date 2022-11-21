import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TablePlayer } from '../models/player.model';
import { iTable, TableModel } from '../models/table.model';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  list$ = new BehaviorSubject<iTable[] | null>(null)

  constructor (
    private _afs: AngularFirestore,
    private _router: Router,
    private _dialog: MatDialog,
    private _player: PlayerService
  ) { }

  async create() {
    try {
      const table = new TableModel()
      await this._afs.collection<TableModel>( 'tables' )
        .doc(table.id)
        .set( { ...table } )


      if ( !this._player.current$.value ) {
        const pid = this._player.currentPlayerID
        console.log( `players/${ this._player.currentPlayerID }` )
        await this._afs.doc<TablePlayer>( `players/${ this._player.currentPlayerID }` ).get().pipe(
          tap( p => console.log( p ) ),
          map(p =>{ if (p.exists) this._player.current$.next(p.data()!)}),
        ).toPromise()
      }

      console.log( this._player.current$.value )
      await this._player.getIn( table.id, table.currentRound, this._player.current$.value!.id )

      this._router.navigate( [ '/table', table.id ], {
        queryParams: {
          rid: table.currentRound
        }
      } )
      return
    } catch (error) {
      return console.error(error)
    }
  }

  get() {
    return this._afs.collection<iTable>( 'tables' )
      .valueChanges().pipe(
        catchError( error => {
          console.error(error);
          return []
        })
      )
  }

  listen() {
    return this._afs.collection<iTable>( 'tables' )
      .valueChanges().pipe(
        map( ( tables: iTable[] ) => {
          this.list$.next( tables )
          return tables
        }),
        catchError( error => {
          console.error(error);
          return []
        })
      )
  }

}
