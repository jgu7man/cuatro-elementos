import { Pipe, PipeTransform } from '@angular/core';
import { combineLatest, from, Observable, of } from 'rxjs';
import { debounceTime, map, mergeMap, mergeScan, reduce } from 'rxjs/operators';
// import { mergeLatest } from "rxjs/operators";
import { iCard } from '../models/table.model';
import { PlayerService } from '../services/player.service';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'avaliableDrop',
})
export class AvalibleDropPipe implements PipeTransform {

  constructor (
    private _table: TableService,
  ){}

  transform( deck: iCard[] ): Observable<boolean> {

    if ( !deck ) { return of(false)}
    return this._table.table$.pipe(
      mergeMap( (table) => {
        console.log( 'update', table )
        if (table?.currentRound.winner) return of(false)
        return from( deck ).pipe(
          mergeMap( card => this._table.allowedCard$( card ) ),
          mergeScan<boolean, boolean[]>( ( acc, available ) => {
            console.log( available  )
            acc.push( available )
            return of(acc)
          }, [] ),
          debounceTime(100),
          map( availables => {
            console.log( availables.some(a => a === true) )
            return availables.some(a => a === true)
          } )
        )}
      )
    )
  }

}
