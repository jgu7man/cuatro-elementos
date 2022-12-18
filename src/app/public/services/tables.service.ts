import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mergeMap,
  reduce,
  tap,
} from 'rxjs/operators';
import { iTable, Moment, TableModel } from '../models/table.model';
import { ErrorSeverity, ErrorsService } from './errors.service';
import { PlayerService } from './player.service';
import firebase from 'firebase/app';

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

  today = new Date().getTime();
  oneDay = 24 * 60 * 60 * 1000;
  batch = firebase.firestore().batch();
  tablesRef = this._afs.collection<iTable>('tables').ref;

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
        debounceTime(1000),
        distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
        mergeMap(tables => this.checkExpiration(tables)),
        map((tables: iTable[]) => {
          this.list$.next(tables);
          return tables;
        }),
        catchError((source) => {
          this._error.handle({
            code: 'table-list/can-not-connect',
            severity: ErrorSeverity.ALERT,
            source,
          });
          return [];
        })
      );
  }

  checkExpiration(tables: iTable[]): Observable<iTable[]> {
    return from(tables).pipe(
      mergeMap(table => this._validateExpiration(table)),
      reduce((a: iTable[], c: iTable | null) => {
        return c ? [...a, c] : a;
      }, []),
      finalize(async () => {
        await this.batch.commit();
        this.batch = firebase.firestore().batch();
      }),
      catchError((error) => {
        return [];
      })
    );
  }

  private _dateToMiliseconds(date: Moment): number {
    return (date instanceof Date ? date : date.toDate()).getTime();
  }

  private async _validateExpiration( table: iTable ): Promise<iTable | null> {
    try {
      const { created, id } = table;
      const diff = this.today - this._dateToMiliseconds(created);

      if (diff > this.oneDay) {
        this.batch.delete(this.tablesRef.doc(id));
        return null;
      }

      return table;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
