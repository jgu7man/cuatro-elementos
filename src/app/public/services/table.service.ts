import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableModel } from '../components/table/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  table$ = new BehaviorSubject<TableModel | null>(null)

  constructor () { }

  initTable() {
    const table = new TableModel()
  }
}
