import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { iCard } from '../models/table.model';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'avaliableDrop',
  pure: true,
})
export class AvalibleDropPipe implements PipeTransform {
  constructor(private _table: TableService) {}

  /**
   * Validate if the player is allowed to drop
   * @param {iCard[]} deck Deck of the player
   * @returns {*}  {Observable<boolean>} true if the player is allowed to drop
   */
  transform(deck: iCard[]): Observable<boolean> {
    return this._table.currentDeck$.pipe(
      map(() => {
        if (!deck) {
          return false;
        }
        if (this._table.table.currentRound.winner) return false;

        const availables = deck.map((card) => this._table.allowedCard(card));
        return availables.some((a) => a === true);
      })
    );
  }
}
