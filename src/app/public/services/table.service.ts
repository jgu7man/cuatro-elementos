import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { iPlayer, TablePlayer } from '../components/lobby/player.model';
import { ColorType, Deck, iCard, iTable, TableModel } from '../components/table/table.model';
import firebase from 'firebase/app'
import { MatDialog } from '@angular/material/dialog';
import { WinnerDialog } from '../components/winner/winner.dialog';
import { SelectColorDialog } from '../components/select-color/select-color.dialog';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  current$ = new BehaviorSubject<iTable | undefined>( undefined );
  round?: number
  tid?: string
  players$ = new BehaviorSubject<TablePlayer[]>( [] )
  colorSelected?: ColorType
  // droppedDeck$ = new BehaviorSubject<iCard[]>( [] );
  private _tableSubscrition?: Subscription
  clockDirection: boolean = true

  constructor (
    private _afs: AngularFirestore,
    private _dialog: MatDialog,
  ) {
  }

  listenTable(tid:string) {
    return this._afs
      .doc<iTable>( `tables/${ tid }` )
      .valueChanges()
      .pipe(
        distinctUntilChanged( ( x, y ) => JSON.stringify( x ) === JSON.stringify( y ) ),
        map( changes => {
          console.log( changes )
          this.current$.next(changes)
        })
      )
  }

  initTable( tid: string, rid: number ) {
    this.round = rid
    this.tid = tid
    return this._afs.doc<iTable>( `tables/${ tid }` ).valueChanges()
      .pipe(
        mergeMap( table => {
          if ( table ) { return this.listenTable(tid) }
          else throw {code: 'table/not-found'}
        } ),
        catchError( this._handleError)
      )
  }

  get roundPath() {
    if ( !this.round ) throw { code: 'round/not-found' }
    if ( !this.tid) throw { code: 'table/tid-undefined' }
    return `tables/${this.tid}/${this.round}`
  }

  get currentTableRef() {
    if ( !this.current$.value ) throw { code: 'table/current-is-undefined'}
    return this._afs.doc<iTable>( `tables/${ this.current$.value.id }` ).ref
  }

  listenPLayers() {
    return this._afs.collection<TablePlayer>( this.roundPath )
      .valueChanges()
      .pipe(
        tap(list => console.log(list)),
        map( list => this.players$.next( list ) )
      );
  }



  async getStarted() {
    const players = this.players$.value
    const batch = this._afs.firestore.batch()

    if ( this.current$.value ) {
      // GET DATABASE REF
      const tableRef = this.currentTableRef
      const playersRef = this._afs.collection<TablePlayer>( this.roundPath ).ref

      // SET BOTH DECKS
      console.log( 'SET BOTH DECKS' )
      // this.droppedDeck$.next( [] )
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
        this._getFirstCards( player, batch )
      } )

      // SET FIRST CARD
      console.log( 'SET FIRST CARD' )
      let startCard
      if ( this.current$.value.deck ) {

        do {
          startCard = this._random<iCard>(this.current$.value.deck)
          if ( startCard.color !== 'blk' ) {
            this.current$.next( {
              ...this.current$.value,
              droppedDeck: [ startCard ]
            } )
            this.current$.value.deck.splice(
              this.current$.value.deck.indexOf( startCard ), 1 )

          }
        } while ( startCard && startCard.color === 'blk' )

      }

      // VALIDATE TABLE STATE
      console.log( 'VALIDATE TABLE STATE' )
      if ( tableRef ) {
        const tableState = await tableRef.get()
        const started = tableState.get( 'started' )
        if ( !started ) {
          // START THE GAME!
          console.log( 'START THE GAME' )
          await batch.commit()
          this.updateTableState( this.current$.value )
        }
      } else {
        console.error('No se tiene la referencia de la mesa');
      }

    }
  }

  private _getFirstCards( player: iPlayer, batch: firebase.firestore.WriteBatch ): void {
    try {
      const playersRef = this._afs.collection( this.roundPath ).ref
      const table = this.current$.value
      let deck: iCard[] = []

      if ( !table ) throw { code: 'table/current-is-undefined' }
      if ( !table.deck) throw { code: 'table/deck-not-found'}

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
    } catch (error) {
      return console.error(error)
    }

  }

  async getCard( ) {
    try {

      const table = this.current$.value

      if (table && table.deck) {
        if ( table.deck.length > 0 ) {
          const card = this._random( table.deck )
          return card
        } throw { code: 'table/deck-empty' }
      } throw { code: 'table/deck-not-found' }

    } catch (error) {
      return console.log( error )
    }
  }


  async takeCard(pid: string) {
    const playerRef = this._afs
          .doc<TablePlayer>( `${ this.roundPath }/${ pid }` ).ref

    await this._afs.firestore.runTransaction( async t => {

      const player = await (await t.get(playerRef)).data()
      if ( !player ) throw { code: 'player/not-found' }
      if ( player.allowTake ) {

        const card = await this.getCard()
        if ( !card ) throw { code: 'card/not-getted' }

        player.deck.push( card )
        player.allowTake = false
        await t.update(playerRef, {...player})
      }
    })

    return
  }

  async changeTurn() {
    const players = this.players$.value
    const batch = this._afs.firestore.batch()
    const playersRef = this._afs.collection(this.roundPath)

    await this.asyncForEach( players, ( player, index ) => {
      if ( index === this.nextPlayer ) {
        player = { ...player, current: true, allowTake: true }
      } else {
        player = { ...player, current: false, allowTake: false}
      }

      batch.update(playersRef.doc(player.id).ref, {...player})
    } )

    await batch.commit()
  }

  letTurn() {
    this.changeTurn()
  }

  get currentPi(){
    return this.players$.value.findIndex( p => p.current)
  }

  get nextPlayer() {
    const next = this.clockDirection
      ? this.currentPi + 1 === this.players$.value.length
        ? 0 : this.currentPi + 1
      : this.currentPi - 1 === -1
        ? this.players$.value.length - 1 : this.currentPi - 1
    return next
  }

  async dropCard( card: iCard ) {
    const table = this.current$.value

    if ( this.avalibleCard(card) ) {
      const players = this.players$.value
      const indexCard = players[this.currentPi].deck.indexOf( card )
      players[ this.currentPi ].deck.splice( indexCard, 1 )

      table?.droppedDeck.push( card )
      this.currentTableRef.update({droppedDeck: table?.droppedDeck})

      const deckLength = players[ this.currentPi ].deck.length
      if ( deckLength === 0 ) {
        this._dialog.open( WinnerDialog, {
          disableClose: true,
          data: players[ this.currentPi ]
        } ).afterClosed().pipe( first() ).subscribe( restart => {
          if(restart) this.getStarted()
        })
      } else if ( deckLength === 1 ) {
        this.setCardValue(card)
      } else this.setCardValue(card)


      this.changeTurn()

    }
  }

  setCardValue(card: iCard) {
    const next = this.players$.value[this.nextPlayer]
    if ( card.value == 'tu' ) {
      this.clockDirection = !this.clockDirection
    } else if ( card.value == 'bl' ) {
      this.changeTurn()
    } else if ( card.value == '+2' ) {
      this.takeCard(next.id)
      this.takeCard(next.id)
    } else if ( card.value == '+4' ) {
      [ 1, 2, 3, 4 ].forEach( card => {
        this.takeCard(next.id)
      })
    }
    if ( card.color === 'blk' ) {
      this.openColorSelecter()
    }
    if ( this.colorSelected ) {
      delete this.colorSelected
    }
  }

  openColorSelecter() {
    this._dialog.open( SelectColorDialog, {
      disableClose: true
    } ).afterClosed().subscribe( color => {
      this.colorSelected = color;
    })

  }

  avalibleCard( card: iCard ) {
    const table = this.current$.value
    const last = table?.droppedDeck[table.droppedDeck.length -1]
    if ( !last ) return true
    else {
      return ( last.color === card.color || last.value === card.value ) ||
        (card.color === 'blk' || card.color === this.colorSelected)
    }
  }

  updatePlayerState( tid: string, player: iPlayer ) {
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
