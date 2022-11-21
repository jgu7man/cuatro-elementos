import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription, SubscriptionLike } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { iPlayer, PlayerModel, TablePlayer } from '../models/player.model';
import { SetNicknameDialog } from '../components/set-nickname/set-nickname.dialog';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public current$ = new BehaviorSubject<TablePlayer | undefined>( undefined );
  private _tid?: string;
  private _rid?: number;
  get playerPath(): string {
    if ( !this._tid ) throw { code: 'table/not-found' }
    if ( !this._rid ) throw { code: 'round/not-found' }
    return `tables/${ this._tid }/${ this._rid }/${ this.currentPlayerID }`
  }
  get currentPlayerID(): string {
    const cache = localStorage.getItem( 'crtPyr' )
    if ( !cache ) throw {code: 'player/not-cached'}
    return JSON.parse(cache)
  }
  private _playerSubscription?: Subscription

  constructor (
    private _afs: AngularFirestore
    , private _dialog: MatDialog
  ) { }

  async init() {
    const player = this.current$.value || new PlayerModel()
    const playerPath =  `players/${ player.id }`
    await this._afs.doc( playerPath ).set( { ...player }, { merge: true } )

    if ( !this.current$.value ) {
      const nickname = await this._dialog.open( SetNicknameDialog ).afterClosed()
        .pipe( first() ).toPromise()
      this._afs.doc<PlayerModel>( playerPath ).update( { nick: nickname } )
      // let p = await this._afs.doc<iPlayer>( playerPath ).ref.get()
      // this.current$.next(p.data())
    }
    localStorage.setItem('crtPyr', JSON.stringify(player.id))

    return player.id
  }

  listenInTable( tid: string, rid: number ) {
    this._tid = tid
    this._rid = rid

    return this._afs.doc<TablePlayer>( this.playerPath )
      .valueChanges()
      .pipe(
        map( changes => {
          console.log( changes )
          this.current$.next( changes )
        } )
      )
  }

  async getIn( tid: string, rid: number,  pid: string ) {
    const playerPath = `tables/${ tid }/${ rid }/${ pid }`

    await this._afs.firestore.runTransaction( async t => {
      let p = await t.get( this._afs.doc( `players/${ pid }` ).ref )
      const crtPlayer = new TablePlayer( pid, p.get('nick') )
      const playerRef = this._afs.doc<TablePlayer>( playerPath )

      t.set(playerRef.ref, { ...crtPlayer } )
      return
    })

    return

  }

  leave() {
    if(this._playerSubscription) this._playerSubscription.unsubscribe()
  }


}
