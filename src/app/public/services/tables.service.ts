import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, first } from 'rxjs/operators';
import { SetNicknameDialog } from '../components/set-nickname/set-nickname.dialog';
import { iTable, TableModel } from '../components/table/table.model';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class TablesService {

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

      this._router.navigate( [ '/table', table.id ], {
        queryParams: {
          rid: table.rounds[0]
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


}