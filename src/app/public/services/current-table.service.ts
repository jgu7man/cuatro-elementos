import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableModel } from '../components/table/table.model';

@Injectable({
  providedIn: 'root'
})
export class CurrentTableService {

  table$ = new BehaviorSubject<TableModel>( new TableModel() )

  constructor() { }
}
