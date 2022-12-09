import { Component } from '@angular/core';
import { PlayerService } from 'src/app/public/services/player.service';
import { TableService } from 'src/app/public/services/table.service';

@Component({
  selector: 'app-actions-bar',
  templateUrl: './actions-bar.component.html',
  styleUrls: ['./actions-bar.component.scss']
})
export class ActionsBarComponent {

  constructor (
    public table_: TableService,
    private _player: PlayerService
  ) { }

  addPlayer() {
    this._player.getIn(this.table_.table.id)
  }

}
