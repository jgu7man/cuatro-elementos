import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { iPlayer, PlayerModel } from '../lobby/player.model';
import { SelectColorDialog } from '../select-color/select-color.dialog';
import { ColorType, iCard, TableModel } from './table.model';

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  idTable: string
  newTable: TableModel
  player: PlayerModel
  droppedDeck: iCard[] = []
  colorSelected?: ColorType

  constructor (
    private _dialog: MatDialog
  ) {
    this.newTable = new TableModel();
    this.idTable = this.newTable.id
    this.player = new PlayerModel('jorge')
  }

  ngOnInit(): void {
    this.getFirstCards()
  }

  getFirstCards() {
    for ( var i = 0; i < 7; i++ ){
      this.getCard()
    }
  }

  getCard() {
    if ( this.newTable.deck.length > 0 ) {
      let card = this.newTable.deck[ Math.floor( Math.random() * this.newTable.deck.length ) ]
      this.player.deck.push( card )
      this.newTable.deck.splice(
        this.newTable.deck.indexOf(card), 1
      )
    }
  }

  dropCard( card: iCard ) {
    if ( this.avalibleCard( card ) ) {
      const index = this.player.deck.indexOf( card )
      this.player.deck.splice( index, 1 )
      this.droppedDeck.push( card )

      if ( card.color === 'blk' ) {
        this.openColorSelecter()
      }

      if ( this.colorSelected ) {
        delete this.colorSelected
      }

    }
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
}
