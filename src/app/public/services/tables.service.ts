import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { iTable, TableModel } from '../models/table.model';
import { ErrorSeverity, ErrorsService } from './errors.service';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root',
})
export class TablesService {
  /**
   * Catch the list of the table changes
   * @type {(BehaviorSubject<iTable[] | null>)}
   */
  list$: BehaviorSubject<iTable[] | null> = new BehaviorSubject<
    iTable[] | null
  >(null);

  constructor(
    private _afs: AngularFirestore,
    private _router: Router,
    private _player: PlayerService,
    private _error: ErrorsService
  ) {}

  /**
   * Create a new table
   * @returns {*}  {Promise<void>}
   */
  async create(): Promise<void> {
    try {
      /* Create the table on database */
      const table = new TableModel();
      await this._afs
        .collection<TableModel>('tables')
        .doc(table.id)
        .set({ ...table })
        .catch((source) => {
          throw {
            code: 'table/could-not-create',
            severity: ErrorSeverity.ALERT,
            source,
          };
        });

      /* Sit the player on the table */
      await this._player.getIn(table.id);

      /* Redirects to the table */
      this._router.navigate(['/table', table.id], {
        queryParams: {
          rid: table.currentRound,
        },
      });
      return;
    } catch (error) {
      this._error.handle(error);
      return;
    }
  }

  /**
   * Listen the list of tables and updates `this.list$`
   * @returns {*}  {Observable<iTable[]>}
   */
  listen(): Observable<iTable[]> {
    return this._afs
      .collection<iTable>('tables', (ref) =>
        ref.orderBy('created', 'desc').limit(10)
      )
      .valueChanges()
      .pipe(
        map((tables: iTable[]) => {
          this.list$.next(tables);
          return tables;
        }),
        catchError((source) => {
          this._error.handle({
            code: 'table-list/con-not-connect',
            severity: ErrorSeverity.ALERT,
            source,
          });
          return [];
        })
      );
  }

  checkExpiration() {}
}
