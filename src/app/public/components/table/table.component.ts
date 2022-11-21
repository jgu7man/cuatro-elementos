import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { iPlayer, PlayerModel } from '../../models/player.model';
import { SelectColorDialog } from '../select-color/select-color.dialog';
import { WinnerDialog } from '../winner/winner.dialog';
import { ColorType, Deck, iCard, TableModel } from '../../models/table.model';
import { concatMap, count, first, map, mergeMap, tap } from 'rxjs/operators'
import { PlayerService } from '../../services/player.service';
import { TableService } from '../../services/table.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

  // idTable: string
  // table?: TableModel
  // player: PlayerModel
  droppedDeck: iCard[] = []
  colorSelected?: ColorType
  players: PlayerModel[] = []
  clockDirection: boolean = true
  #tid: string = ''
  set tid(tid: string){this.#tid = tid;}
  get tid(): string{ return this.#tid }
  private pid: string
  public rid!: number

  private tableSubscription?: Subscription
  private playaersSubscription?: Subscription
  private playerInTableSubscription?: Subscription

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
    // console.log( this.rid )
    this.tableSubscription =
      this.table_.initTable( this.tid ).pipe(
        concatMap( () => this.table_.listenPlayers().pipe(count()) ),
        tap( event => console.log( event ) ),
      ).subscribe()
    // this.playaersSubscription =
    this.playerInTableSubscription =
      this.player_.listenInTable(this.tid, this.rid).subscribe()
    if ( !this.pid ) this.pid = await this.player_.init()

  }

  ngOnDestroy(): void {

  }

  addPlayer() {
    this.player_.getIn(this.tid, this.rid, this.pid)
  }

  async getStarted() {
    await this.table_.getStarted()
    this.playerInTableSubscription =
      this.player_.listenInTable(this.tid, this.rid).subscribe()
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
