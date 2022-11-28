import { Pipe, PipeTransform } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
// import { mergeLatest } from "rxjs/operators";
import { iCard } from '../models/table.model';
import { PlayerService } from '../services/player.service';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'avalibleCard',
})
export class AvalibleCardPipe implements PipeTransform {

  constructor (
    private _table: TableService,
    private _player: PlayerService
  ){}

  transform( card: iCard ): Observable<boolean> {
    return combineLatest(
      this._table.allowedCard$( card ),
      this._table.allowedPlayer$()
    ).pipe( map( ( [ available, allowed ] ) => {
      return available && allowed
    }))
  }

}
