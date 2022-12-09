import { Component, OnDestroy, OnInit } from '@angular/core';
import { count, mergeMap } from 'rxjs/operators';
import { PlayerService } from '../../services/player.service';
import { TableService } from '../../services/table.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  /**
   * Stores the table Id
   * @type {string}
   */
  get tid(): string {
    return this.#tid;
  }
  set tid(tid: string) {
    this.#tid = tid;
  }
  #tid: string = '';
  /**
   * Stores the round Id
   * @type {number}
   */
  public rid!: number;
  /**
   * Allows unsubscribe the table
   * @private
   * @type {Subscription}
   */
  private tableSubscription?: Subscription;

  constructor(
    public player_: PlayerService,
    public table_: TableService,
    private _route: ActivatedRoute,
    private clipboard: Clipboard,
    private _snack: MatSnackBar
  ) {
    this.tid = this._route.snapshot.params['tid'];
    this._route.queryParams.subscribe((queryParams) => {
      this.rid = +queryParams['rid'];
    });
  }

  async ngOnInit() {
    this.tableSubscription = this.table_
      .connectTable(this.tid)
      .pipe(mergeMap(() => this.table_.listenPlayers().pipe(count())))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.tableSubscription?.unsubscribe();
  }
  /**
   * Copies the table id to share out
   */
  onShare() {
    let splits = window.location.href.split('/');
    let url = `${splits[0]}//${splits[2]}/table/${this.tid}`;
    this.clipboard.copy(url);
    this._snack.open('Enlace copiado');
  }
}
