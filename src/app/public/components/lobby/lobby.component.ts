import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TablesService } from '../../services/tables.service';
import { TableModel } from '../table/table.model';

@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  public list$: Observable<TableModel[]>
  constructor (
    public tables: TablesService,
  ) {
    this.list$ = this.tables.get()
  }

  ngOnInit(): void {
  }




}
