import { Component } from '@angular/core';
import { TableService } from 'src/app/public/services/table.service';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent {
  constructor(public table: TableService) {}
}
