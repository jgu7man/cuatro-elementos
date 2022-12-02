import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { iPlayer, iTablePlayer, TablePlayer } from '../models/player.model';
import { ColorType, Deck, iCard, iTable, Round } from '../models/table.model';
import { MatDialog } from '@angular/material/dialog';
import { WinnerDialog } from '../components/winner/winner.dialog';
import { catchError, debounceTime, distinctUntilChanged, first, map, mergeMap,  tap } from 'rxjs/operators';
import { SelectColorDialog } from '../components/select-color/select-color.dialog';
import firebase from 'firebase/app'
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PlayerService } from './player.service';


@Injectable({
  providedIn: 'root'
})
export class TableService {

  table$ = new BehaviorSubject<iTable | undefined>( undefined );
  players$ = new BehaviorSubject<iTablePlayer[]>( [] )
  currentDeck$ = new BehaviorSubject<iCard[]>( [] )
  public allowedPlayer$ = new BehaviorSubject<boolean>(false);

  /** Table instance from BehaviorSubject subject */
  get table() {
    if (!this.table$.value) throw {code: 'table/current-is-undefined'}
    return this.table$.value
  }
  /** Firebase ref for the current table */
  get tableRef() {
    if ( !this.table ) throw { code: 'table/current-is-undefined'}
    return this._afs.doc<iTable>( `tables/${ this.table.id }` ).ref
  }
  /** List of current players in table  */
  get players() { return this.players$.value }

  get playersCol() {
    return this._afs.collection<iTablePlayer>( 'players' )
  }

  /** Index of current player */
  get currentPi(){
    return this.players.findIndex( p => p.inTurn)
  }

  get nextPlayer() {
    return this.players[ this._getNextPlayerIndex() ]
  }

  get nextPlayerRef() {
    return this._afs.doc
      <TablePlayer>( `players/${ this.nextPlayer.id }` )
      .ref
  }

  constructor (
    private _afs: AngularFirestore,
    private _dialog: MatDialog,
    private _router: Router,
    private _player: PlayerService
  ) { }

  private waitFor = (ms: number) => new Promise(r => setTimeout(r, ms))

  /** Connect to the table on firestore */
  connectTable( tid: string ): Observable<any> {
    return this._afs
      .doc<iTable>( `tables/${ tid }` )
      .valueChanges()
      .pipe(
        distinctUntilChanged( ( x, y ) => JSON.stringify( x ) === JSON.stringify( y ) ),
        debounceTime(500),
        map( changes => {
          console.log( 'TABLE CHANGED' )
          if ( changes ) {
            if (changes.currentRound.winner) this._noticeWinner(changes.currentRound.winner);
            this.table$.next( changes )
            this.currentDeck$.next( changes.deck || [] )
            return changes
          } else {
            this._router.navigate(['/'])
            throw { code: 'table/not-found' }
          }
        } ),
        mergeMap(() => this.listenPlayers() ),
        catchError( this._handleError )
      )
  }

  /** Connect to the table players on firestore */
  listenPlayers(): Observable<iTablePlayer[] | undefined> {
    return this._afs.collectionGroup<iTablePlayer>( 'players',
      ref => ref.where( 'tableId', '==', this.table.id ) )
      .valueChanges()
      .pipe(
        tap( () => console.log( 'LISTEN PLAYERS' ) ),
        map( list => {
          if ( list ) {
            this.players$.next( list )
            this.allowedPlayer$.next(this._getAllowedPlayer(list))
            return list
          } else throw {code: 'players/not-found'}
        } ),
        catchError( this._handleError )
      );
  }

  /***********************************
  PLAYTIME ACTIONS
  ***********************************/

  /** Start the game. */
  async getStarted(): Promise<void> {
    const batch = this._afs.firestore.batch()

    if ( this.table ) {
      // SET BOTH DECKS
      console.log( 'SET BOTH DECKS' )
      // this.droppedDeck$.next( [] )
      this.table.deck = Deck.map( c => c )

      // SELECT RANDOM START PLAYER
      console.log( 'SELECT RANDOM START PLAYER' )
      const startPlayer = this.players[ Math.floor( Math.random() * this.players.length ) ]

      // SET PLAYERS DECKS
      console.log( 'SET PLAYERS DECK' )
      await this._asyncForEach( this.players, async ( player: TablePlayer ) => {
        player.deck = await this._moveCards(player.deck, 7)
        player.inTurn = player.id === startPlayer.id
        batch.update(this.playersCol.ref.doc(player.id), {...player})
      } )

      // SET FIRST CARD
      console.log( 'SET FIRST CARD' )
      let startCard:iCard, startCardIndex: number
      if ( this.table.deck ) {

        do {
          startCard = this._random<iCard>( this.table.deck )
          startCardIndex = this.table.deck.indexOf( startCard )

          if ( startCard.color !== 'blk' ) {
            this.table.droppedDeck = [ startCard ],
            this.table.deck.splice(startCardIndex, 1)
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
          batch.update( this.tableRef, {
            ...this.table, started: true
          })
          await batch.commit()
        }
      } else {
        console.error('No se tiene la referencia de la mesa');
      }

    }
  }

  /** Take a card from main deck for player id */
  async takeCard(): Promise<void> {
    try {
      console.log( 'TAKE CARD' )
      const allowTake = await this.allowedPlayer$.pipe( first() ).toPromise()
      const currentPlayer = this._player.current$.value;
      if ( !currentPlayer ) throw { code: 'player/not-found' }

      if ( allowTake ) {
        currentPlayer.deck =  await this._moveCards(currentPlayer.deck)
      }

      /* UPDATE TURN */
      console.log( 'UPDATE PLAYER' )
      this.players[ this.currentPi ] = currentPlayer
      this.changeTurn()

      return
    } catch (error) {
      return console.error( error )
    }
  }

  /** On player drop card */
  async dropCard( card: iCard ): Promise<void> {
    if ( !this._player.current$.value ) throw { code: 'player/current-not-found' }
    console.log( 'DROP CARD' )
    const allowedCard = this.allowedCard( card )
    const allowedPlayer = await this.allowedPlayer$.pipe( first() ).toPromise()
    const playerDeck: iCard[] = this._player.current$.value.deck

    if ( allowedCard && allowedPlayer ) {
      const indexCard = playerDeck
        .findIndex( c => c.id === card.id )

      console.log( 'SPLICE CARD' )
      playerDeck.splice( indexCard, 1 )
      this.players[ this.currentPi ].deck = playerDeck
      console.log( 'PUSH CARD' )
      this.table.droppedDeck.push( card )
      this.table.colorSelected = firebase.firestore.FieldValue.delete()

      console.log( 'VALIDATE PLAYER DECK LENGTH' )
      const deckLength = this._player.current$.value.deck.length
      if ( deckLength === 0 ) {
        /* Set winner */
        this.table.currentRound.winner = this._player.current$.value.id
      } else if ( deckLength === 1 ) {
        // TODO Call UNO
      }

      return this._setCardValue( card )
    }
  }

  /** Change of player turn */
  async changeTurn(turns: number = 1): Promise<void> {
    try {
      const batch = this._afs.firestore.batch()

      console.log( 'UPDATE TURN OF PLAYERS' )
      await this._asyncForEach( this.players, ( player, index ) => {
        if ( index === this._getNextPlayerIndex(turns) ) {
          player = { ...player, inTurn: true }
        } else {
          player = { ...player, inTurn: false }
        }
        batch.update(this.playersCol.ref.doc(player.id), {...player})
      } )

      console.log( 'UPDATE TABLE' )
      batch.update(this.tableRef, this.table)

      console.log( 'PUSH CHANGES ON DB' )
      return batch.commit()
    } catch (error: any) {
      console.error( error )
    }
  }

  /** Restart game in new round */
  async restart(): Promise<void> {
    console.log( 'RESTART' )
    try {
      const batch = this._afs.firestore.batch()

      console.log( 'UPDATE PLAYERS' )
      await this._asyncForEach( this.players, async ( player ) => {
        player.deck = []
        player.inTurn = false
        batch.update( this.playersCol.ref.doc( player.id ), { ...player } )
      } )

      console.log( 'SET NEW ROUND' )
      let newRound: Round = {
        id: new Date().getTime(),
        lastMovement: new Date(),
        winner: ''
      }

      console.log( 'UPDATE TABLE' )
      batch.update( this.tableRef, {
        ...this.table,
        droppedDeck: [],
        deck: Deck.map( c => c ),
        currentRound: newRound,
        clockDirection: true,
        started: false,
        rounds: [ ...this.table.rounds, newRound ],
      })

      console.log( 'PUSH CHANGES ON DB' )
      await batch.commit()
      console.log( 'NAVIGATE TO ROUND' )
      this._router.navigate( [], { queryParams: { rid: newRound } } )
      return
    } catch ( error ) {
      console.error( error )
    }
  }

  playerLeave() {
    if ( !this._player.current$.value ) throw { code: 'player/not-found' }
    let player = this._player.current$.value
    if ( player.tableId ) {
      this.table.droppedDeck = [ ...player.deck, ...this.table.droppedDeck ]
      player.deck = []
      player.tableId = firebase.firestore.FieldValue.delete()
      if ( this.table.started ) {
        this.players[ this.currentPi ] = player
        this.changeTurn()
      }
      else this.playersCol.doc(player.id).update({...player})
    }
  }

  /**
   * Puts a ramdom card from table on specific player deck
   *
   * @private
   * @param {iCard[]} deck
   * @returns {*}
   */
  private async _moveCards(deck: iCard[], cant: number = 1): Promise<iCard[]> {
    if ( !this.table ) throw { code: 'table/current-is-undefined' }
    if ( !this.table.deck ) throw { code: 'table/deck-not-found' }

    // TODO Action for table empty deck
    if ( this.table.deck.length == 0 ) throw { code: 'table/deck-empty' }

    /* Get random cards for player deck */
    for ( var i = 0; i < cant; i++ ){
      if ( this.table.deck.length > 0 ) {
        const card = this._random( this.table.deck )
        if ( !card ) throw { code: 'card/not-getted' }
        deck = [ ...deck, card]
        this.table.deck.splice( this.table.deck.indexOf( card ), 1 )
        await this.waitFor(250)
      }
    }

    // this._updateTableState(this.table)
    return deck
  }


  /** Set the effect of card for next turn */
  private async _setCardValue( card: iCard ): Promise<void> {
    console.log( 'SET CARD VALUE' )
    switch (card.value ) {
      case 'tu':
        console.log( 'CHANGE DIRECTION' )
        this.table.clockDirection = !this.table.clockDirection
        return this.changeTurn();
      case 'bl':
        console.log( 'JUMP TURN' )
        return this.changeTurn(2);
      case '+2':
        console.log( 'GIVE 2' )
        this.nextPlayer.deck = await this._moveCards( this.nextPlayer.deck, 2 )
        this.players[this._getNextPlayerIndex()] = this.nextPlayer
        return this.changeTurn();
      case '+4':
        console.log( 'GIVE 4' )
        this.nextPlayer.deck = await this._moveCards( this.nextPlayer.deck, 4 )
        this.players[ this._getNextPlayerIndex() ] = this.nextPlayer
        await this._openColorSelecter()
        return this.changeTurn();
      case 'ch':
        console.log( 'CHANGE COLOR' )
        await this._openColorSelecter()
        return this.changeTurn();
      default:
        console.log( 'VALUE DONT APPLIED' )
        return this.changeTurn()
    }
  }

  /** Check if card is avalible */
  public allowedCard( card: iCard ): boolean {
    if ( this.table.droppedDeck.find( c => c.id === card.id ) ) return false
    const last = this.table.droppedDeck[this.table.droppedDeck.length -1]
    if ( !last ) return false
    else {
      if ( last.color === card.color ) {
        // console.log( 'Same color', card, last.color )
        return true
      } else if ( last.value === card.value ) {
        // console.log( 'Same value', card, last.value )
        return true
      } else if ( card.color === 'blk' ) {
        // console.log( 'Is black', card )
        return true
      } else if ( card.color === this.table.colorSelected ) {
        // console.log( 'Color selected', card, this.table.colorSelected )
        return true
      }

      return false
      // return  (last.color === card.color || last.value === card.value)  ||
      //   (card.color === 'blk' || card.color === this.table.colorSelected)
    }


  }

  private _getAllowedPlayer( players: iTablePlayer[] ) {
    try {
      if ( !players.length ) throw {code: 'players/not-found'}
      const current = players.find( p => p.id === this._player.currentPlayerID )
      if ( current && current.inTurn ) {
        console.log( 'PLAYER IN TURN' )
        return true
      }
      return false
    } catch ( error ) {
      return false
    }
  }

  /** Open color selecter */
  private async _openColorSelecter(): Promise<void> {
    const color: ColorType = await this._dialog.open( SelectColorDialog, {
      disableClose: true,
      data: this.table.id
    } ).afterClosed().pipe( first() )
      .toPromise()

    console.log( 'COLOR SELECTED: ', color )
    this.table.colorSelected = color;
    return
  }

  private _noticeWinner( pid: string ): void {
    // const winner = this.players.find(p => p.id === pid)
    this._dialog.open( WinnerDialog, {
      disableClose: true,
      data: pid
    } ).afterClosed().pipe( first() ).subscribe( restart => {
      if ( restart ) this.getStarted()
      else {
        this.playerLeave()
        this._router.navigate( [ '/' ] )
      }
    })
  }

  private _random<T>(list: T[]): T {
    return list[ Math.floor( Math.random() * list.length ) ]
  }

  private _handleError( error: any ): Observable<undefined> {
    if ( error.code && error.code === 'table/not-found' ) {
      Swal.fire( {
        icon: 'warning',
        title: 'Mesa no encontrada',
        text: '¡Ups! Disculpa, no pudimos encontrar la mesa que buscas. Tal vez quieras revisar bien el código o crear una nueva 😊. '
      } )
    }
    return of(undefined)
  }

  private async _asyncForEach( array: any[], callback: ( item: any, index: number, a: any[] ) => any ) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  private _getNextPlayerIndex( turns: number = 1 ): number {
    return this.table.clockDirection
      ? this.currentPi + turns >= this.players.length
        ? -1 + turns
        : this.currentPi + turns
      : this.currentPi - turns < 0
        ? this.players.length - turns : this.currentPi - turns
   }
}
