import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription, SubscriptionLike } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { iPlayer, iTablePlayer, PlayerModel, TablePlayer } from '../models/player.model';
import { SetNicknameDialog } from '../components/set-nickname/set-nickname.dialog';
import firebase from 'firebase/app'

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public current$ = new BehaviorSubject<iTablePlayer | undefined>( undefined );

  get currentRef() {
    return this._afs.doc<iTablePlayer>( `players/${ this.currentPlayerID }` )
  }

  get currentPlayerID(): string {
    const cache = localStorage.getItem( 'crtPyr' )
    if ( !cache ) throw {code: 'player/not-cached'}
    return JSON.parse(cache)
  }
  private _playerSubscription?: Subscription

  constructor (
    private _afs: AngularFirestore,
    private _dialog: MatDialog
  ) { }

  async init() {
    const player = this.current$.value || new PlayerModel()
    const playerPath =  `players/${ player.id }`
    await this._afs.doc( playerPath ).set( { ...player }, { merge: true } )

    if ( !this.current$.value ) {
      const nickname = await this._dialog.open( SetNicknameDialog )
        .afterClosed()
        .pipe( first() )
        .toPromise()

      this._afs.doc<PlayerModel>( playerPath ).update( { nick: nickname } )
    }
    localStorage.setItem('crtPyr', JSON.stringify(player.id))

    return player.id
  }

  listen() {
    return this.currentRef.valueChanges().pipe(
      map( changes => {
        // console.log( changes )
        this.current$.next( changes )
      } )
    )
  }

  async getIn( tid: string ) {
    if (!this.current$.value) throw {code: 'player/not-found'}
    if ( this.current$.value.tableId ) throw { code: 'table/actually-in' }

    this.currentRef.update(  {
      ...this.current$.value,
      deck: [],
      inTurn: false,
      tableId: tid
    } )

    return
  }




}
