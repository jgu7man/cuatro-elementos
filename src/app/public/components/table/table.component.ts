import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { iPlayer, PlayerModel } from '../lobby/player.model';
import { SelectColorDialog } from '../select-color/select-color.dialog';
import { WinnerDialog } from '../winner/winner.dialog';
import { ColorType, Deck, iCard, TableModel } from './table.model';
import { first, map, mergeMap } from 'rxjs/operators'
import { PlayerService } from '../../services/player.service';
import { TableService } from '../../services/table.service';
import { ActivatedRoute } from '@angular/router';
import { SetNicknameDialog } from '../set-nickname/set-nickname.dialog';

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  // idTable: string
  table?: TableModel
  // player: PlayerModel
  droppedDeck: iCard[] = []
  colorSelected?: ColorType
  players: PlayerModel[] = []
  clockDirection: boolean = true
  private tid: string
  private pid: string

  constructor (
    private _dialog: MatDialog,
    private _player: PlayerService,
    private _table: TableService,
    private _route: ActivatedRoute
  ) {
    this.tid = this._route.snapshot.params['tid'];
    this.pid = this._route.snapshot.queryParams['p'];
  }

  ngOnInit(): void {
    this._table.initTable( this.tid ).pipe(
    ).subscribe( async table => {
      console.log( table )
      this._player.setCurrentPlayer(this.tid, this.pid)
      this._player.current$.subscribe( player => console.log( player ) )
    })
  }

  addPlayer() {
    this.players.push(new PlayerModel())
  }

  getStarted() {
    if (this.table) {
      this.droppedDeck = []
      this.table.deck = Deck.map(c => c)

      const startPlayer = this.players[ Math.floor( Math.random() * this.players.length ) ]
      startPlayer.current = true
      startPlayer.allowTake = true

      this.players.forEach( ( player, index ) => this.getFirstCards( index ) )

      let startCard

      do {
        startCard = this.table.deck[ Math.floor( Math.random() * this.table.deck.length ) ]

        if ( startCard.color !== 'blk' ) {
          this.droppedDeck.push( startCard )
          this.table.deck.splice( this.table.deck.indexOf(startCard), 1 )
        }

      } while (  startCard && startCard.color === 'blk' )

    }
  }



  getFirstCards(player: number): void {
    for ( var i = 0; i < 7; i++ ){
      this.getCard(player)
    }
  }

  getCard(player: number) {
    if (this.table && this.table.deck) {
      if ( this.table.deck.length > 0 ) {
        const card = this.table.deck[ Math.floor( Math.random() * this.table.deck.length ) ]

        this.players[ player ].deck.push( card )
        this.table.deck.splice(
          this.table.deck.indexOf(card), 1
        )
      }
    }
  }

  takeCard(player:number) {
    if ( this.players[ player ].allowTake ) {
      this.getCard( player )
      this.players[ player ].allowTake = false
    }
  }

  letTurn() {
    this.changeTurn()
  }

  get current() {
    return this.players.findIndex( p => p.current === true)
  }

  get next() {
    const next = this.clockDirection
      ? this.current + 1 === this.players.length ? 0 : this.current + 1
      : this.current - 1 === -1 ? this.players.length - 1 : this.current - 1
    return next
  }

  dropCard( card: iCard ) {
    if ( this.avalibleCard( card ) ) {
      const indexCard = this.players[this.current].deck.indexOf( card )
      this.players[this.current].deck.splice( indexCard, 1 )
      this.droppedDeck.push( card )

      const deckLength = this.players[ this.current ].deck.length
      if ( deckLength === 0 ) {
        this._dialog.open( WinnerDialog, {
          disableClose: true,
          data: this.players[ this.current ]
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
    if ( card.value == 'tu' ) {
      this.clockDirection = !this.clockDirection
    } else if ( card.value == 'bl' ) {
      this.changeTurn()
    } else if ( card.value == '+2' ) {
      this.getCard(this.next)
      this.getCard(this.next)
    } else if ( card.value == '+4' ) {
      [ 1, 2, 3, 4 ].forEach( card => {
        this.getCard(this.next)
      })
    }
    if ( card.color === 'blk' ) {
      this.openColorSelecter()
    }
    if ( this.colorSelected ) {
      delete this.colorSelected
    }
  }

  changeTurn() {
    this.players = this.players.map( ( player, index ) => {
      return index === this.next
      ? { ...player, current: true, allowTake: true }
      : { ...player, current: false, allowTake: false}
     })
  }

  avalibleCard( card: iCard ) {
    const last = this.droppedDeck[this.droppedDeck.length -1]
    if ( !last ) return true
    else {
      return ( last.color === card.color || last.value === card.value ) ||
        (card.color === 'blk' || card.color === this.colorSelected)
    }
  }

  openColorSelecter() {
    this._dialog.open( SelectColorDialog, {
      disableClose: true
    } ).afterClosed().subscribe( color => {
      this.colorSelected = color;
    })

  }
  restart() {
    this.players.forEach( player => {
      player.deck = []
    } )
    this.getStarted()
  }
}
