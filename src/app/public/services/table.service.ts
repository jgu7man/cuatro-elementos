import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { iPlayer, TablePlayer } from '../models/player.model';
import { ColorType, Deck, iCard, iTable } from '../models/table.model';
import { MatDialog } from '@angular/material/dialog';
import { WinnerDialog } from '../components/winner/winner.dialog';
import { catchError, distinctUntilChanged, first, map, mergeMap,  tap } from 'rxjs/operators';
import { SelectColorDialog } from '../components/select-color/select-color.dialog';
import firebase from 'firebase/app'
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor (
    private _afs: AngularFirestore,
    private _dialog: MatDialog,
  ) {}

  table$ = new BehaviorSubject<iTable | undefined>( undefined );
  players$ = new BehaviorSubject<TablePlayer[]>( [] )
  currentDeck$ = new BehaviorSubject<iCard[]>( [] )

  /** Table instance from BehaviorSubject subject */
  get table() { return this.table$.value}
  /** List of current players in table  */
  get players() {return this.players$.value}
  /** Path to current round of table */
  get roundPath() {
    if ( !this.table?.currentRound ) throw { code: 'round/not-found' }
    if ( !this.table?.id) throw { code: 'table/tid-undefined' }
    return `tables/${this.table.id}/${this.table.currentRound}`
  }
  /** Firebase ref for the current table */
  get tableRef() {
    if ( !this.table ) throw { code: 'table/current-is-undefined'}
    return this._afs.doc<iTable>( `tables/${ this.table.id }` ).ref
  }
  get playersRef() {
    return this._afs.collection<TablePlayer>( this.roundPath ).ref
  }
  /** Index of current player */
  get currentPi(){
    return this.players.findIndex( p => p.current)
  }
  /** ID of current player */
  get currentPID() {
    return this.players[ this.currentPi ].id
  }
  /** Firebase Reference of current player */
  get currentPlayerRef() {
    if ( !this.table ) throw { code: 'table/current-is-undefined' }
    if ( !this.players[ this.currentPi ] ) throw { code: 'players/current-is-undefined' }
    return this._afs.doc<TablePlayer>( `${ this.roundPath }/${ this.currentPID }` ).ref
  }
  /** Index of next player */
  get nextPlayerIndex() {
    const next = this.table?.clockDirection
      ? this.currentPi + 1 === this.players.length
        ? 0 : this.currentPi + 1
      : this.currentPi - 1 === -1
        ? this.players.length - 1 : this.currentPi - 1
    return next
  }

  get nextPlayerID() {
    return this.players[ this.nextPlayerIndex ].id
  }
  get nextPlayerRef() {
    return this._afs.doc
      <TablePlayer>( `${ this.roundPath }/${ this.nextPlayerID }` )
      .ref
  }
  

  

  /** Connect to the table on firestore */
  initTable( tid: string ): Observable<iTable | undefined> {
    return this._afs
      .doc<iTable>( `tables/${ tid }` )
      .valueChanges()
      .pipe(
        distinctUntilChanged( ( x, y ) => JSON.stringify( x ) === JSON.stringify( y ) ),
        map( changes => {
          console.log( changes )
          if ( changes ) {
            this.table$.next( changes )
            this.currentDeck$.next( changes?.deck || [] )
            return changes
          } else throw {code: 'table/not-found'}
        } ),
        catchError( this._handleError )
      )
  }

  /** Connect to the table players on firestore */
  listenPLayers(): Observable<TablePlayer[] | undefined> {
    return this._afs.collection<TablePlayer>( this.roundPath )
      .valueChanges()
      .pipe(
        tap(list => console.log(list)),
        map( list => {
          if ( list ) {
            this.players$.next( list )
            return list
          } else throw {code: 'players/not-found'}
        } ),
        catchError( this._handleError )
      );
  }

  

  


  /** Start the game. */
  async getStarted() {
    const batch = this._afs.firestore.batch()

    if ( this.table$.value ) {
      // SET BOTH DECKS
      console.log( 'SET BOTH DECKS' )
      // this.droppedDeck$.next( [] )
      this.table$.next( {
        ...this.table$.value,
        deck: Deck.map( c => c )
      } )

      // SELECT RANDOM START PLAYER
      console.log( 'SELECT RANDOM START PLAYER' )
      const startPlayer = this.players[ Math.floor( Math.random() * this.players.length ) ]
      startPlayer.current = true
      startPlayer.allowTake = true
      batch.update(this.playersRef.doc(startPlayer.id), {...startPlayer})

      // SET PLAYERS DECKS
      console.log( 'SET PLAYERS DECK' )
      await this._asyncForEach(this.players, async ( player ) => {
        await this._getFirstCards( player, batch )
      } )

      // SET FIRST CARD
      console.log( 'SET FIRST CARD' )
      let startCard
      if ( this.table$.value.deck ) {

        do {
          startCard = this._random<iCard>(this.table$.value.deck)
          if ( startCard.color !== 'blk' ) {
            this.table$.next( {
              ...this.table$.value,
              droppedDeck: [ startCard ]
            } )
            this.table$.value.deck.splice(
              this.table$.value.deck.indexOf( startCard ), 1 )

          }
        } while ( startCard && startCard.color === 'blk' )

      }

      // VALIDATE TABLE STATE
      console.log( 'VALIDATE TABLE STATE' )
      if ( this.tableRef ) {
        const tableState = await this.tableRef.get()
        const started = tableState.get( 'started' )
        if ( !started ) {
          // START THE GAME!
          console.log( 'START THE GAME!' )
          await batch.commit()
          this._updateTableState( this.table$.value )
        }
      } else {
        console.error('No se tiene la referencia de la mesa');
      }

    }
  }

  /** Provide for deck to current player */
  private async _getFirstCards( player: iPlayer, batch: firebase.firestore.WriteBatch ): Promise<void> {
    try {
      let playerDeck: iCard[] = []

      if ( !this.table ) throw { code: 'table/current-is-undefined' }
      if ( !this.table.deck) throw { code: 'table/deck-not-found'}

      /* Get random cards for player deck */
      for ( var i = 0; i < 7; i++ ){
        if ( this.table.deck.length > 0 ) {
          const card = this._random( this.table.deck )
          playerDeck.push( card )
          this.table.deck.splice( this.table.deck.indexOf(card), 1 )
        }
      }

      batch.update( this.playersRef.doc( player.id ), {
        ...player, deck: playerDeck
      })
      this.table$.next(this.table)
    } catch (error) {
      return console.error(error)
    }

  }  

  /** Take a card from main deck for player id */
  async takeCard( pid: string ): Promise<void> {
    try {
      const playerRef = this._afs
        .doc<TablePlayer>( `${ this.roundPath }/${ pid }` ).ref
      await this._afs.firestore.runTransaction( async t => {
  
        const player = await (await t.get(playerRef)).data()
        if ( !player ) throw { code: 'player/not-found' }
        if ( player.allowTake ) {
  
          if ( !this.table ) throw { code: 'table/current-is-undefined' }
          if ( !this.table.deck ) throw { code: 'table/deck-not-found' }
          if ( this.table.deck.length == 0 ) throw { code: 'table/deck-empty' }
          const card = this._random( this.table.deck )
          if ( !card ) throw { code: 'card/not-getted' }
  
          player.deck.push( card )
          player.allowTake = false
          await t.update(playerRef, {...player})
        }
      })
  
      return
    } catch (error) {
      return console.log( error )
    }
  }

  /** Change of player turn */
  async changeTurn(): Promise<void> {
    try {
      const batch = this._afs.firestore.batch()

      await this._asyncForEach( this.players, ( player, index ) => {
        if ( index === this.nextPlayerIndex ) {
          player = { ...player, current: true, allowTake: true }
        } else {
          player = { ...player, current: false, allowTake: false}
        }
        batch.update(this.playersRef.doc(player.id), {...player})
      } )
      await batch.commit()
      return
    } catch (error: any) {
      console.error( error )
    }
  }

  /** On player drop card */
  async dropCard( card: iCard ): Promise<void> {

    if ( this._avalibleCard(card) ) {
      const indexCard = this.players[ this.currentPi ].deck
        .findIndex( c => c.id === card.id )
      this.players[ this.currentPi ].deck.splice( indexCard, 1 )

      this.table?.droppedDeck.push( card )
      this.tableRef.update({droppedDeck: this.table?.droppedDeck})

      const deckLength = this.players[ this.currentPi ].deck.length
      if ( deckLength === 0 ) {
        /* Set winner */
        this._dialog.open( WinnerDialog, {
          disableClose: true,
          data: this.players[ this.currentPi ]
        } ).afterClosed().pipe( first() ).subscribe( restart => {
          if(restart) this.getStarted()
        })
      } else if ( deckLength === 1 ) {
        this._setCardValue(card)
      } else this._setCardValue(card)
      
      this.changeTurn()
    }
  }

  /** Restart game in new round */
  async restart(): Promise<void> {
    try {
      const batch = this._afs.firestore.batch()
      await this._asyncForEach( this.players, async ( player ) => {
        player.deck = []
        player.current = false
        player.allowTake = false
        batch.update( this.playersRef.doc( player.id ), { ...player } )
      } )

      let newRound = new Date().getTime()
      batch.update( this.tableRef, {
        ...this.table,
        droppedDeck: [],
        deck: [],
        currentRound: newRound,
        clockDirection: true,
        started: false,
        rounds: [ ...this.table!.rounds, newRound ],
      })

      await batch.commit()
      this.getStarted()
    } catch ( error ) {
      console.error( error )
    }
  }









  /** Set the effect of card for next turn */
  private _setCardValue(card: iCard): void {
    if ( card.value == 'tu' ) {
      this.table!.clockDirection = !this.table?.clockDirection
    } else if ( card.value == 'bl' ) {
      this.changeTurn()
    } else if ( card.value == '+2' ) {
      this.takeCard(this.nextPlayerID)
      this.takeCard(this.nextPlayerID)
    } else if ( card.value == '+4' ) {
      [ 1, 2, 3, 4 ].forEach( card => {
        this.takeCard(this.nextPlayerID)
      })
    }
    if ( card.color === 'blk' ) {
      this._openColorSelecter()
    }
    if ( this.table?.colorSelected ) {
      delete this.table.colorSelected
    }
  }

  /** Open color selecter */
  private _openColorSelecter() {
    this._dialog.open( SelectColorDialog, {
      disableClose: true
    } ).afterClosed().pipe( first() )
      .subscribe( ( color: ColorType ) => {
        this.table!.colorSelected = color;
      })
  }

  /** Check if card is avalible */
  private _avalibleCard( card: iCard ) {
    const table = this.table$.value
    const last = table?.droppedDeck[table.droppedDeck.length -1]
    if ( !last ) return true
    else {
      return ( last.color === card.color || last.value === card.value ) ||
        (card.color === 'blk' || card.color === this.table?.colorSelected)
    }
  }

  private _updatePlayerState( tid: string, player: iPlayer ) {
    this._afs.doc( `tables/${ tid }/players/${ player.id }` ).update( player )
  }

  private _updateTableState( table: iTable ) {
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

  private async _asyncForEach( array: any[], callback: ( item: any, index: number, a: any[] ) => any ) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
