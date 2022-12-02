import { Pipe, PipeTransform } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, debounceTime, switchMap } from 'rxjs/operators';
// import { mergeLatest } from "rxjs/operators";
import { iCard } from '../models/table.model';
import { PlayerService } from '../services/player.service';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'avalibleCard',
  pure: true,
})
export class AvalibleCardPipe implements PipeTransform {

  constructor (
    private _table: TableService,
    private _player: PlayerService
  ){}

  transform( card: iCard ): Observable<boolean> {
    // console.log( this._table.allowedCard( card ) )
    // console.log( this._table.allowedPlayer$.value )
    return this._table.allowedPlayer$.pipe(
      switchMap( allowed => {
        console.log( allowed )
        if ( allowed ) return of(this._table.allowedCard( card ));
        else return of(false)
      })
    )
    // return combineLatest(
    //   of(this._table.allowedCard( card )),
    //   this._table.allowedPlayer$
    // ).pipe(
    //   map( ( [ available, allowed ] ) => {
    //   // console.log( card )
    //   return available && allowed
    // }))
  }

}
