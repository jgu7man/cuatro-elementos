import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss'],
})
export class PublicComponent implements OnInit, OnDestroy {
  /**
   * Store the player id
   * @private
   * @type {string}
   */
  private pid: string;
  /**
   * Allows unsubscribe from player
   * @private
   * @type {Subscription}
   */
  private playerSignedSubscription?: Subscription;

  constructor(public player_: PlayerService) {
    this.pid = JSON.parse(sessionStorage.getItem('crtPyr')!);
  }

  async ngOnInit(): Promise<void> {
    if (!this.pid) this.pid = await this.player_.create();
    this.playerSignedSubscription = this.player_.listen().subscribe();
  }

  ngOnDestroy(): void {
    this.playerSignedSubscription?.unsubscribe();
  }
}
