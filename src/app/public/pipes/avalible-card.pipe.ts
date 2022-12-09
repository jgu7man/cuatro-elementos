import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { iCard } from '../models/table.model';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'avalibleCard',
  pure: true,
})
export class AvalibleCardPipe implements PipeTransform {
  constructor(private _table: TableService) {}

  /**
   * Validate if the card is availabe to drop
   * @param {iCard} card
   * @returns {*}  {Observable<boolean>}
   */
  transform(card: iCard): Observable<boolean> {
    return this._table.allowedPlayer$.pipe(
      switchMap((allowed) => {
        console.log(allowed);
        if (allowed) return of(this._table.allowedCard(card));
        else return of(false);
      })
    );
  }
}
