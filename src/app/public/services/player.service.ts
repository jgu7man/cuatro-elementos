import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  tap,
} from 'rxjs/operators';
import { iTablePlayer, PlayerModel } from '../models/player.model';
import { SetNicknameDialog } from '../components/set-nickname/set-nickname.dialog';
import { ErrorSeverity, ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  /**
   * Catch the current player changes
   */
  public current$ = new BehaviorSubject<iTablePlayer | undefined>(undefined);
  /**
   * Validate and create the current player state
   * @readonly
   * @type {iTablePlayer}
   */
  get current(): iTablePlayer {
    if (!this.current$.value)
      throw {
        code: 'player/current-not-found',
        severity: ErrorSeverity.ALERT,
      };

    return this.current$.value;
  }
  /**
   * The current player reference to firestore
   * @readonly
   * @type {AngularFirestoreDocument<iTablePlayer>}
   */
  get currentRef(): AngularFirestoreDocument<iTablePlayer> {
    return this._afs.doc<iTablePlayer>(`players/${this.currentPlayerID}`);
  }
  /**
   * The cached player id from localStorage
   * @readonly
   * @type {string}
   */
  get currentPlayerID(): string {
    const cache = localStorage.getItem('crtPyr');
    if (!cache) throw { code: 'player/not-cached' };
    return JSON.parse(cache);
  }

  constructor(
    private _afs: AngularFirestore,
    private _dialog: MatDialog,
    private _error: ErrorsService
  ) {}

  /**
   * Crea o actualiza el jugador
   * @returns {*}  {Promise<string>} El id del jugador creado
   */
  async create(): Promise<string> {
    try {
      console.log('CRATE PLAYER');
      const player = this.current$.value || new PlayerModel();
      const playerPath = `players/${player.id}`;

      // Ask for a username if does not exist
      if (!this.current$.value) {
        const nickname = await this._dialog
          .open(SetNicknameDialog, {
            minWidth: 420,
          })
          .afterClosed()
          .pipe(first())
          .toPromise();

        player.nick = nickname;
      }

      await this._afs
        .doc(playerPath)
        .set({ ...player }, { merge: true })
        .catch((source) => {
          throw {
            code: 'player/cant-not-set',
            severity: ErrorSeverity.ALERT,
            source,
          };
        });
      localStorage.setItem('crtPyr', JSON.stringify(player.id));

      return player.id;
    } catch (error) {
      this._error.handle(error);
      return '';
    }
  }

  /**
   * Se conecta con el jugador en la base de datos y actualiza el `this.current$`
   * @returns {*}  {(Observable<iTablePlayer | undefined>)}
   */
  listen(): Observable<iTablePlayer | undefined> {
    return this.currentRef.valueChanges().pipe(
      distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
      debounceTime(500),
      tap((changes) => this.current$.next(changes)),
      catchError((error) => {
        return this._error.handle({
          code: 'player/can-not-connect',
          severity: ErrorSeverity.SNACK,
          source: error,
        });
      })
    );
  }

  /**
   * Sienta al jugador en la mesa
   * @param {string} tid El id de la mesa donde se sentará
   * @returns {*}  {Promise<void>}
   */
  async getIn(tid: string): Promise<void> {
    try {
      if (this.current.tableId)
        throw {
          code: 'player/actually-in',
          severity: ErrorSeverity.ALERT,
        };

      this.currentRef
        .update({
          ...this.current$.value,
          deck: [],
          inTurn: false,
          tableId: tid,
        })
        .catch((source) => {
          throw {
            code: 'player/can-not-set',
            severity: ErrorSeverity.ALERT,
            source,
          };
        });

      return;
    } catch (error) {
      this._error.handle(error);
      return;
    }
  }

  /**
   * Reinicia al jugador
   * @returns {*}  {Promise<void>}
   */
  async purge(): Promise<void> {
    try {
      await this._afs
        .doc(`players/${this.currentPlayerID}`)
        .ref.delete()
        .catch((source) => {
          throw {
            code: 'player/can-not-delete',
            severity: ErrorSeverity.ALERT,
            source,
          };
        });
      localStorage.removeItem('crtPyr');
      window.location.reload();
      return;
    } catch (error) {
      this._error.handle(error);
      return;
    }
  }
}
