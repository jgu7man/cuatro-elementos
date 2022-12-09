import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TablesService } from '../../services/tables.service';
import { PlayerService } from '../../services/player.service';

@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnDestroy {
  /**
   * Allows unsuscribe from list of tables
   * @private
   * @type {Subscription}
   */
  private tablesSubscription: Subscription;
  constructor(public tables: TablesService, public player: PlayerService) {
    this.tablesSubscription = this.tables.listen().subscribe();
  }

  ngOnDestroy(): void {
    this.tablesSubscription.unsubscribe();
  }
}
