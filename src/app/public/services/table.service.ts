import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { iPlayer } from '../components/lobby/player.model';
import { Deck, iCard, iTable, TableModel } from '../components/table/table.model';
import firebase from 'firebase/app'

@Injectable({
  providedIn: 'root'
})
export class TableService {

  current$ = new BehaviorSubject<iTable | undefined>(undefined);
  players$ = new BehaviorSubject<iPlayer[]>([])
  droppedDeck$ = new  BehaviorSubject<iCard[]>([]);

  constructor (
    private _afs: AngularFirestore
  ) { }

  initTable( tid: string ) {
    const tableRef = this._afs.doc<iTable>( `tables/${ tid }` )
    tableRef.collection<iPlayer>('players').valueChanges()
    return this._afs.doc<iTable>( `tables/${ tid }` )
      .valueChanges()
      .pipe(
        map( table => {
          if ( table ) {
            this.current$.next( table )
            return table
          }
          else throw {code: 'table/not-found'}
        } ),
        catchError( this._handleError)
      )
  }

  listenPLayers( tid: string ) {
    return this._afs.collection<iPlayer>( `tables/${ tid }/players` )
      .valueChanges()
      .pipe(map(list => this.players$.next(list)));
  }


  async getStarted() {
    const players = this.players$.value
    const batch = this._afs.firestore.batch()

    if ( this.current$.value ) {
      // GET DATABASE REF
      const tableRef = this._afs
        .doc<iTable>( `tables/${ this.current$.value.id }` ).ref
      const playersRef = this._afs
        .collection<iPlayer>( `tables/${ this.current$.value.id }/players` ).ref

      // SET BOTH DECKS
      console.log( 'SET BOTH DECKS' )
      this.droppedDeck$.next( [] )
      this.current$.next( {
        ...this.current$.value,
        deck: Deck.map( c => c )
      } )

      // SELECT RANDOM START PLAYER
      console.log( 'SELECT RANDOM START PLAYER' )
      const startPlayer = players[ Math.floor( Math.random() * players.length ) ]
      startPlayer.current = true
      startPlayer.allowTake = true
      batch.update(playersRef.doc(startPlayer.id), {...startPlayer})

      // SET PLAYERS DECKS
      console.log( 'SET PLAYERS DECK' )
      await this.asyncForEach(players,  ( player ) => {
        this.getFirstCards( player, batch )
      } )

      // SET FIRST CARD
      console.log( 'SET FIRST CARD' )
      let startCard
      if ( this.current$.value.deck ) {

        do {
          startCard = this._random<iCard>(this.current$.value.deck)
          if ( startCard.color !== 'blk' ) {
            this.droppedDeck$.next([...this.droppedDeck$.value, startCard ])
            this.current$.value.deck.splice(
              this.current$.value.deck.indexOf( startCard ), 1 )

          }
        } while ( startCard && startCard.color === 'blk' )

      }

      // VALIDATE TABLE STATE
      console.log( 'VALIDATE TABLE STATE' )
      const tableState = await tableRef.get()
      const started = tableState.get( 'started' )
      if ( !started ) {
        // START THE GAME!
        console.log( 'START THE GAME' )
        await batch.commit()
        this.updateTableState( this.current$.value )
      }

    }
  }

  getFirstCards( player: iPlayer, batch: firebase.firestore.WriteBatch ): void {
    const table = this.current$.value
    let deck: iCard[] = []
    if ( table && table.deck ) {
      const playersRef = this._afs.collection(`tables/${table.id}/players`).ref
      for ( var i = 0; i < 7; i++ ){
        if ( table.deck.length > 0 ) {
          const card = this._random( table.deck )
          deck.push( card )
          table.deck.splice( table.deck.indexOf(card), 1 )
        }
      }
      batch.update( playersRef.doc( player.id ), {
        ...player, deck: deck
      })
      this.current$.next(table)
    }
  }

  getCard( player: number ) {
    const table = this.current$.value
    if (table && table.deck) {
      if ( table.deck.length > 0 ) {
        const card = this._random(table.deck)

        // this.players[ player ].deck.push( card )
        // this.table.deck.splice(
        //   this.table.deck.indexOf(card), 1
        // )
      }
    }
  }

  updatePlayerState(tid: string, player: iPlayer) {
    this._afs.doc( `tables/${ tid }/players/${ player.id }` ).update( player )
  }

  updateTableState( table: iTable ) {
    this._afs.doc(`tables/${table.id}`).update( table )
  }

  private _random<T>(list: T[]) {
    return list[ Math.floor( Math.random() * list.length ) ]
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

  async asyncForEach( array: any[], callback: ( item: any, index: number, a: any[] ) => any ) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
