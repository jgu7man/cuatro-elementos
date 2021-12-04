import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { PlayerModel } from '../components/lobby/player.model';
import { SetNicknameDialog } from '../components/set-nickname/set-nickname.dialog';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  current$ = new BehaviorSubject<PlayerModel | undefined>(undefined);
  constructor (
    private _afs: AngularFirestore
    , private _dialog: MatDialog
  ) { }

  async init( tid: string ) {
    const player = this.current$.value || new PlayerModel()
    const playerPath =  `tables/${ tid }/rounds/${ player.id }`
    await this._afs.doc( playerPath ).set( { ...player }, { merge: true } )

    if ( !this.current$.value ) {
      const nickname = await this._dialog.open( SetNicknameDialog ).afterClosed()
        .pipe( first() ).toPromise()
      this._afs.doc<PlayerModel>( playerPath ).update( { nick: nickname } )
      let p = await this._afs.doc<PlayerModel>( playerPath ).ref.get()
      this.current$.next(p.data())
    }


    return player.id
    // this._afs.doc<PlayerModel>( playerPath ).valueChanges()
    //   .subscribe(player => this.current$.next( player ))

  }

  setCurrentPlayer( tid: string, pid: string ) {
    const playerPath =  `tables/${ tid }/rounds/${ pid }`
    this._afs.doc<PlayerModel>( playerPath ).get()
      .pipe(first())
      .subscribe(player => this.current$.next( player.data() ))
  }
}
