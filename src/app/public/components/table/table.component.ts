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

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  // idTable: string
  // table?: TableModel
  // player: PlayerModel
  droppedDeck: iCard[] = []
  colorSelected?: ColorType
  players: PlayerModel[] = []
  clockDirection: boolean = true
  private tid: string
  private pid: string
  public rid!: number


  constructor (
    private _dialog: MatDialog,
    public player_: PlayerService,
    public table_: TableService,
    private _route: ActivatedRoute
  ) {
    this.tid = this._route.snapshot.params['tid'];
    this.pid = JSON.parse( localStorage.getItem( 'crtPyr' )! )
    this._route.queryParams.subscribe( queryParams => {
      this.rid = +queryParams['rid']
    });
  }

  async ngOnInit() {
    console.log( this.rid )
    this.table_.initTable( this.tid, this.rid).pipe().subscribe()
    this.table_.listenPLayers().subscribe()
    this.player_.listenInTable(this.tid, this.rid).subscribe()
    if ( !this.pid ) this.pid = await this.player_.init()

  }

  addPlayer() {
    this.player_.getIn(this.tid, this.rid, this.pid)
  }




  // get current() {
  //   return this.players.findIndex( p => p.current === true)
  // }

  // get next() {
  //   const next = this.clockDirection
  //     ? this.current + 1 === this.players.length ? 0 : this.current + 1
  //     : this.current - 1 === -1 ? this.players.length - 1 : this.current - 1
  //   return next
  // }






  avalibleCard( card: iCard ) {
    const last = this.droppedDeck[this.droppedDeck.length -1]
    if ( !last ) return true
    else {
      return ( last.color === card.color || last.value === card.value ) ||
        (card.color === 'blk' || card.color === this.colorSelected)
    }
  }


  // restart() {
  //   this.players.forEach( player => {
  //     player.deck = []
  //   } )
  //   this.getStarted()
  // }
}
