import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit, OnDestroy {

  private pid: string
  private playaersSubscription?: Subscription
  private playerSignedSubscription?: Subscription

  constructor (
    public player_: PlayerService
  ) {
    this.pid = JSON.parse( localStorage.getItem( 'crtPyr' )! )
  }

  async ngOnInit(): Promise<void> {
    if ( !this.pid ) this.pid = await this.player_.init()
    this.playerSignedSubscription =
    this.player_.listen().subscribe()
  }

  ngOnDestroy(): void {
      this.playerSignedSubscription?.unsubscribe()
  }

}
