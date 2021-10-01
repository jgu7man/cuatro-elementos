import { Component, OnInit } from '@angular/core';
import { iPlayer, PlayerModel } from '../lobby/player.model';
import { iCard, TableModel } from './table.model';

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  idTable: string
  newTable: TableModel
  player: PlayerModel
  constructor () {
    this.newTable = new TableModel();
    this.idTable = this.newTable.id
    this.player = new PlayerModel('jorge')
  }

  ngOnInit(): void {
    this.getCards()
  }

  getCards() {
    this.player.deck
    for ( var i = 0; i < 7; i++ ){
      let card = this.newTable.deck[ Math.floor( Math.random() * this.newTable.deck.length ) ]
      this.player.deck.push( card )
      this.newTable.deck.splice(
        this.newTable.deck.indexOf(card), 1
      )
    }
  }

}
