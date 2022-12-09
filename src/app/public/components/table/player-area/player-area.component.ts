import { Component, Input } from '@angular/core';
import { PlayerService } from 'src/app/public/services/player.service';
import { TableService } from 'src/app/public/services/table.service';

@Component({
    selector: 'app-player-area',
    templateUrl: './player-area.component.html',
    styleUrls: ['./player-area.component.scss']
})
export class PlayerAreaComponent {
  constructor (
    public table: TableService,
    public player: PlayerService
    ) {}
}
