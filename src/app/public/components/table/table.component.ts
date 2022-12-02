import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerModel } from '../../models/player.model';
import { ColorType, iCard } from '../../models/table.model';
import { concatMap, count } from 'rxjs/operators'
import { PlayerService } from '../../services/player.service';
import { TableService } from '../../services/table.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app'

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

  droppedDeck: iCard[] = []
  colorSelected?: ColorType | firebase.firestore.FieldValue
  players: PlayerModel[] = []
  clockDirection: boolean = true
  #tid: string = ''
  set tid(tid: string){this.#tid = tid;}
  get tid(): string{ return this.#tid }

  public rid!: number

  private tableSubscription?: Subscription

  constructor (
    public player_: PlayerService,
    public table_: TableService,
    private _route: ActivatedRoute
  ) {
    this.tid = this._route.snapshot.params['tid'];
    this._route.queryParams.subscribe( queryParams => {
      this.rid = +queryParams['rid']
    });
  }

  async ngOnInit() {
    // console.log( this.rid )
    this.tableSubscription =
      this.table_.connectTable( this.tid ).pipe(
        // concatMap( () => this.table_.listenPlayers().pipe(count()) ),
        // tap( event => console.log( event ) ),
      ).subscribe()
    // this.playaersSubscription =

  }

  ngOnDestroy(): void {
    this.tableSubscription?.unsubscribe()
  }

  addPlayer() {
    this.player_.getIn(this.tid)
  }

  async getStarted() {
    await this.table_.getStarted()
  }

}
