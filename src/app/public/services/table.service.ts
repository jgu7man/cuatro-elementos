import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { iTablePlayer, TablePlayer } from '../models/player.model';
import { Deck, iCard, iTable, Round } from '../models/table.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WinnerDialog } from '../components/winner/winner.dialog';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  mergeMap,
  tap,
} from 'rxjs/operators';
import { SelectColorDialog } from '../components/select-color/select-color.dialog';
import firebase from 'firebase/app';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Router } from '@angular/router';
import { PlayerService } from './player.service';
import { ErrorsService, ErrorSeverity } from './errors.service';
import { ColorChoice } from '../models/colors.model';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  /**
   * Catch the table changes in database
   */
  table$ = new BehaviorSubject<iTable | undefined>(undefined);
  /**
   * Catch the players from the table in database
   */
  players$ = new BehaviorSubject<iTablePlayer[]>([]);
  /**
   * Current deck of the table
   */
  currentDeck$ = new BehaviorSubject<iCard[]>([]);
  /**
   * Catch the player turn validation
   */
  public allowedPlayer$ = new BehaviorSubject<boolean>(false);

  /**
   * Table instance from BehaviorSubject subject
   * @readonly
   * @type {iTable}
   */
  get table(): iTable {
    if (!this.table$.value) throw { code: 'table/current-is-undefined' };
    return this.table$.value;
  }
  /**
   * Firebase ref for the current table
   * @readonly
   * @type {DocumentReference<iTable>}
   */
  get tableRef(): DocumentReference<iTable> {
    if (!this.table) throw { code: 'table/current-is-undefined' };
    return this._afs.doc<iTable>(`tables/${this.table.id}`).ref;
  }
  /**
   * List of current players in table
   * @readonly
   * @type {iTablePlayer[]}
   */
  get players(): iTablePlayer[] {
    return this.players$.value;
  }
  /**
   * Firebase ref to the players collection
   * @readonly
   * @type {AngularFirestoreCollection<iTablePlayer>}
   */
  get playersCol(): AngularFirestoreCollection<iTablePlayer> {
    return this._afs.collection<iTablePlayer>('players');
  }
  /**
   * Index of current player
   * @readonly
   * @type {number}
   */
  get currentPi(): number {
    return this.players.findIndex((p) => p.inTurn);
  }
  /**
   * The next player to play, based on the clockDirection and turns
   * @readonly
   * @type {iTablePlayer}
   */
  get nextPlayer(): iTablePlayer {
    return this.players[this._getNextPlayerIndex()];
  }
  /**
   * Firebase refenence to the next player
   * @readonly
   * @type {DocumentReference<TablePlayer>}
   */
  get nextPlayerRef(): DocumentReference<TablePlayer> {
    return this._afs.doc<TablePlayer>(`players/${this.nextPlayer.id}`).ref;
  }

  constructor(
    private _afs: AngularFirestore,
    private _dialog: MatDialog,
    private _router: Router,
    private _player: PlayerService,
    private _error: ErrorsService
  ) {}

  /**
   * Promise the allows wait for milliseconds specified
   * @private
   * @param {number} ms milliseconds to waitFor
   */
  private waitFor = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /**
   * Connect to the table on firestore and listen to events in database. Also:
   * - update `this.table$`
   * - update `this.currentDeck`
   * - notify winner
   * @param {string} tid The table id to connect
   * @returns {*}  {(Observable<iTable | undefined>)} a table object
   */
  connectTable(tid: string): Observable<iTable | undefined> {
    return this._afs
      .doc<iTable>(`tables/${tid}`)
      .valueChanges()
      .pipe(
        distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
        debounceTime(500),
        map((changes) => {
          console.log('TABLE CHANGED');
          if (changes) {
            this._noticeWinner(changes.currentRound.winner);
            this.table$.next(changes);
            this.currentDeck$.next(changes.deck || []);
            return changes;
          } else {
            this._router.navigate(['/']);
            throw {
              code: 'table/not-found',
              severity: ErrorSeverity.ALERT,
            };
          }
        }),
        catchError(this._error.handle)
      );
  }

  /**
   * Connect to every players in table on firestore and listen for changes from database. Also:
   * - update `this.players$`
   * - validate the in turn.
   * @returns {*}  {(Observable<iTablePlayer[] | undefined>)} A list of players
   */
  listenPlayers(): Observable<iTablePlayer[] | undefined> {
    return this._afs
      .collectionGroup<iTablePlayer>('players', (ref) =>
        ref.where('tableId', '==', this.table.id)
      )
      .valueChanges()
      .pipe(
        distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
        debounceTime(500),
        map((list) => {
          if (list) {
            this.players$.next(list);
            this.allowedPlayer$.next(this._getAllowedPlayer(list));
            return list;
          } else
            throw {
              code: 'table/players-not-found',
              severity: ErrorSeverity.ALERT,
            };
        }),
        catchError(this._error.handle)
      );
  }

  /***********************************
  PLAYTIME ACTIONS
  ***********************************/

  /**
   * Start the game running all the process.
   * @returns {*}  {Promise<void>}
   */
  async getStarted(): Promise<void> {
    console.group('STARTING GAME');
    try {
      const batch = this._afs.firestore.batch();

      // SET BOTH DECKS
      // this.droppedDeck$.next( [] )
      this.table.deck = Deck.map((c) => c);
      console.log('SET BOTH DECKS');

      // SELECT RANDOM START PLAYER
      const startPlayer =
        this.players[Math.floor(Math.random() * this.players.length)];
      console.log('SELECT RANDOM START PLAYER: ', startPlayer.nick);

      // SET PLAYERS DECKS
      await this._asyncForEach(this.players, async (player: TablePlayer) => {
        player.deck = await this._moveCards(player.deck, 7);
        player.inTurn = player.id === startPlayer.id;
        batch.update(this.playersCol.ref.doc(player.id), { ...player });
      });
      console.log('PLAYERS DECK SET');

      // SET FIRST CARD
      let startCard: iCard, startCardIndex: number;
      if (this.table.deck) {
        do {
          startCard = this._random<iCard>(this.table.deck);
          startCardIndex = this.table.deck.indexOf(startCard);

          if (startCard.color !== 'blk') {
            (this.table.droppedDeck = [startCard]),
              this.table.deck.splice(startCardIndex, 1);
          }
        } while (startCard && startCard.color === 'blk');
      }
      console.log('FIRST CARD DROPPED');

      // VALIDATE TABLE STATE
      console.log('VALIDATING TABLE STATE');
      if (!this.tableRef)
        throw {
          code: 'table/ref-not-found',
          severity: ErrorSeverity.ALERT,
        };

      const tableState = await this.tableRef.get();
      const started = tableState.get('started');
      if (started)
        throw {
          code: 'table/started',
          severity: ErrorSeverity.SNACK,
        };

      // START THE GAME!
      console.log('START THE GAME!');
      batch.update(this.tableRef, {
        ...this.table,
        started: true,
      });

      return batch.commit();
    } catch (error) {
      this._error.handle(error);
    }
    console.groupEnd();
  }

  /**
   * Take a card from main deck for player in turn
   * @returns {*}  {Promise<void>}
   */
  async takeCard(): Promise<void> {
    console.groupCollapsed('TAKING CARD');
    try {
      const allowTake = await this.allowedPlayer$.pipe(first()).toPromise();

      if (allowTake) {
        this._player.current.deck = await this._moveCards(
          this._player.current.deck
        );
      } else
        throw {
          code: 'player/cannot-take',
          severity: ErrorSeverity.SNACK,
        };

      /* UPDATE TURN */
      console.log('UPDATE PLAYER');
      this.players[this.currentPi] = this._player.current;
      return this.changeTurn();
    } catch (error) {
      this._error.handle(error);
    }
    console.groupEnd();
  }

  /**
   * On player drop card. Also:
   * - update the player turn
   * - validate if there's a winner
   * - set a special effect from the dropped card value.
   * @param {iCard} card Card player select to drop.
   * @returns {*}  {Promise<void>}
   */
  async dropCard(card: iCard): Promise<void> {
    console.group('CARD DROPPED: ', `${card.value} ${card.color}`);

    try {
      const allowedPlayer = await this.allowedPlayer$.pipe(first()).toPromise();
      const playerDeck: iCard[] = this._player.current.deck;

      if (!allowedPlayer)
        throw {
          code: 'player/not-allowed',
          severity: ErrorSeverity.SNACK,
        };
      if (this.allowedCard(card))
        throw {
          code: 'card/not-allowed',
          severity: ErrorSeverity.NONE,
        };

      const indexCard = playerDeck.findIndex((c) => c.id === card.id);

      console.log('SPLICE CARD');
      playerDeck.splice(indexCard, 1);
      this.players[this.currentPi].deck = playerDeck;
      console.log('PUSH CARD');
      this.table.droppedDeck.push(card);
      this.table.colorSelected = firebase.firestore.FieldValue.delete();

      console.log('VALIDATING PLAYER DECK LENGTH');
      const deckLength = this._player.current.deck.length;
      if (deckLength === 0) {
        /* Set winner */
        this.table.currentRound.winner = this._player.current.id;
      } else if (deckLength === 1) {
        // TODO Call UNO
      }

      return this._setCardValue(card);
    } catch (error) {
      this._error.handle(error);
    }
    console.groupEnd();
  }

  /**
   * Change of player turn
   * @param {number} [turns=1] Cant players  that will change move the turn
   * @returns {*}  {Promise<void>}
   */
  async changeTurn(turns: number = 1): Promise<void> {
    console.group(`CHANGING ${turns} ${turns > 1 ? 'TURNS' : 'TURN'}`);
    try {
      const batch = this._afs.firestore.batch();

      console.log('UPDATE TURN OF PLAYERS');
      await this._asyncForEach(this.players, (player, index) => {
        if (index === this._getNextPlayerIndex(turns)) {
          player = { ...player, inTurn: true };
        } else {
          player = { ...player, inTurn: false };
        }
        batch.update(this.playersCol.ref.doc(player.id), { ...player });
      });

      console.log('UPDATE TABLE');
      batch.update(this.tableRef, this.table);

      console.log('PUSH CHANGES ON DB');
      return batch.commit();
    } catch (error: any) {
      this._error.handle(error);
    }
    console.groupEnd();
  }

  /**
   * Restart game in new round
   * @returns {*}  {Promise<void>}
   */
  async restart(): Promise<void> {
    console.group('RESTARTING');
    try {
      const batch = this._afs.firestore.batch();

      console.log('UPDATE PLAYERS');
      await this._asyncForEach(this.players, async (player) => {
        player.deck = [];
        player.inTurn = false;
        batch.update(this.playersCol.ref.doc(player.id), { ...player });
      });

      console.log('SET NEW ROUND');
      let newRound: Round = {
        id: new Date().getTime(),
        lastMovement: new Date(),
        winner: '',
      };

      console.log('UPDATE TABLE');
      batch.update(this.tableRef, {
        ...this.table,
        droppedDeck: [],
        deck: Deck.map((c) => c),
        currentRound: newRound,
        clockDirection: true,
        started: false,
        rounds: [...this.table.rounds, newRound],
      });

      console.log('PUSH CHANGES ON DB');
      await batch.commit();
      console.log('NAVIGATE TO ROUND');
      this._router.navigate([], { queryParams: { rid: newRound } });
      return;
    } catch (error) {
      this._error.handle(error);
    }
    console.groupEnd();
  }

  /**
   * Delete the tableId form the player, take its cards and return them to the main deck.
   */
  playerLeave(): void {
    console.group('PLAYER LEAVING 🙁');
    try {
      if (!this._player.current.tableId)
        throw {
          code: 'player/are-not-in-table',
          severity: ErrorSeverity.SNACK,
        };

      this.table.droppedDeck = [
        ...this._player.current.deck,
        ...this.table.droppedDeck,
      ];
      this._player.current.deck = [];
      this._player.current.tableId = firebase.firestore.FieldValue.delete();
      if (this.table.started) {
        this.players[this.currentPi] = this._player.current;
        this.changeTurn();
      } else
        this.playersCol
          .doc(this._player.current.id)
          .update({ ...this._player.current });
    } catch (error) {
      this._error.handle(error);
    }
    console.groupEnd();
  }

  /**
   * Puts a ramdom card from table on specific player deck
   * @private
   * @param {iCard[]} deck Deck where will be put the card.
   * @returns {*}
   */
  private async _moveCards(deck: iCard[], cant: number = 1): Promise<iCard[]> {
    try {
      if (!this.table.deck)
        throw {
          code: 'table/deck-not-found',
          severity: ErrorSeverity.ALERT,
        };

      // TODO Action for table empty deck
      if (this.table.deck.length == 0)
        throw {
          code: 'table/deck-empty',
          severity: ErrorSeverity.NONE,
        };

      /* Get random cards for player deck */
      for (var i = 0; i < cant; i++) {
        if (this.table.deck.length > 0) {
          const card = this._random(this.table.deck);
          if (!card) throw { code: 'card/not-getted' };
          deck = [...deck, card];
          this.table.deck.splice(this.table.deck.indexOf(card), 1);
          await this.waitFor(250);
        }
      }

      return deck;
    } catch (error) {
      this._error.handle(error);
      return [];
    }
  }

  /**
   * Set the effect of card for next turn from the card dropped from
   * @private
   * @param {iCard} card Card dropped
   * @returns {*}  {Promise<void>}
   */
  private async _setCardValue(card: iCard): Promise<void> {
    try {
      console.log('SET CARD VALUE');
      switch (card.value) {
        case 'tu':
          console.log('CHANGE DIRECTION');
          this.table.clockDirection = !this.table.clockDirection;
          break;
        case 'bl':
          console.log('JUMP TURN');
          return this.changeTurn(2);
        case '+2':
          console.log('GIVE 2');
          this.nextPlayer.deck = await this._moveCards(this.nextPlayer.deck, 2);
          this.players[this._getNextPlayerIndex()] = this.nextPlayer;
          break;
        case '+4':
          console.log('GIVE 4');
          this.nextPlayer.deck = await this._moveCards(this.nextPlayer.deck, 4);
          this.players[this._getNextPlayerIndex()] = this.nextPlayer;
          await this._openColorSelecter();
          break;
        case 'ch':
          console.log('CHANGE COLOR');
          await this._openColorSelecter();
          break;
        default:
          console.log('VALUE DONT APPLIED');
          break;
      }

      return this.changeTurn();
    } catch (error) {
      this._error.handle(error);
      return;
    }
  }

  /**
   * Check if card is avalible validating with the last card of the dropped deck.
   * @param {iCard} card
   * @returns {*}  {boolean}
   */
  public allowedCard(card: iCard): boolean {
    try {
      if (this.table.droppedDeck.find((c) => c.id === card.id))
        throw {
          code: 'table/card-previously-dropped',
          severity: ErrorSeverity.ALERT,
        };

      const last = this.table.droppedDeck[this.table.droppedDeck.length - 1];

      if (!last)
        throw {
          code: 'table/not-cards-dropped',
          severity: ErrorSeverity.ALERT,
        };
      else {
        // if (last.color === card.color) {
        //   // console.log( 'Same color', card, last.color )
        //   return true;
        // } else if (last.value === card.value) {
        //   // console.log( 'Same value', card, last.value )
        //   return true;
        // } else if (card.color === 'blk') {
        //   // console.log( 'Is black', card )
        //   return true;
        // } else if (card.color === this.table.colorSelected) {
        //   // console.log( 'Color selected', card, this.table.colorSelected )
        //   return true;
        // }

        // return false;
        return (
          last.color === card.color ||
          last.value === card.value ||
          card.color === 'blk' ||
          card.color === this.table.colorSelected
        );
      }
    } catch (error) {
      this._error.handle(error);
      return false;
    }
  }

  /**
   * Check if the current player is in turn
   * @private
   * @param {iTablePlayer[]} players
   * @returns {*}
   */
  private _getAllowedPlayer(players: iTablePlayer[]) {
    try {
      const currentPlayer = this._player.current$.value;
      if (!currentPlayer)
        throw {
          code: 'player/not-found',
          severity: ErrorSeverity.ALERT,
        };

      if (!players.length)
        throw {
          code: 'table/players-not-found',
          severity: ErrorSeverity.ALERT,
        };

      const current = players.find(
        (p) => p.id === this._player.currentPlayerID
      );
      if (current && current.inTurn) {
        console.log('PLAYER IN TURN: ', current.nick);
        return true;
      }

      return false;
    } catch (error) {
      this._error.handle(error);
      return false;
    }
  }

  /**
   * Open the dialog to select the color of the next turn. This is triggered when the player drop a Color Change card o +4 value card
   * @private
   * @returns {*}  {Promise<void>}
   */
  private async _openColorSelecter(): Promise<void> {
    try {
      const color: ColorChoice = await this._dialog
        .open(SelectColorDialog, {
          disableClose: true,
          data: this.table.id,
        })
        .afterClosed()
        .pipe(first())
        .toPromise();

      console.log('COLOR SELECTED: ', color);
      this.table.colorSelected = color;
      return;
    } catch (error) {
      this._error.handle(error);
      return;
    }
  }

  /**
   * It open the modal to notify the user that wins
   * @private
   * @param {string} [pid] The ID of the player
   */
  private _noticeWinner(pid?: string): void {
    let openedDialog: MatDialogRef<WinnerDialog> | undefined;
    if (pid) {
      openedDialog = this._dialog.open(WinnerDialog, {
        disableClose: true,
        data: pid,
      });

      openedDialog
        .afterClosed()
        .pipe(first())
        .subscribe((restart) => {
          if (restart) this.restart();
          else {
            this.playerLeave();
            this._router.navigate(['/']);
          }
        });
    } else {
      if (openedDialog) {
        openedDialog.close();
      }
    }
  }

  /**
   * Take a random item from the provided list,
   * @private
   * @template T Type of items
   * @param {T[]} list Array of items
   * @returns {*}  {T}
   */
  private _random<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Generate a promise from list loop
   * @private
   * @param {any[]} array Array that will be go over
   * @param {(item: any, index: number, a: any[]) => any} callback
   */
  private async _asyncForEach(
    array: any[],
    callback: (item: any, index: number, a: any[]) => any
  ) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  /**
   * Get the next player index from the player list and based on the cant of turns that will change
   * @private
   * @param {number} [turns=1] Cant of turns that will change
   * @returns {*}  {number}
   */
  private _getNextPlayerIndex(turns: number = 1): number {
    return this.table.clockDirection
      ? this.currentPi + turns >= this.players.length
        ? -1 + turns
        : this.currentPi + turns
      : this.currentPi - turns < 0
      ? this.players.length - turns
      : this.currentPi - turns;
  }
}
