import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TablesService } from '../../services/tables.service';
import { TableModel } from '../../models/table.model';

@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {

  private tablesSubscription: Subscription
  constructor (
    public tables: TablesService,
  ) {
    this.tablesSubscription = this.tables.listen().subscribe()
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.tablesSubscription.unsubscribe()
  }


}
