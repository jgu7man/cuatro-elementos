import { Pipe, PipeTransform } from '@angular/core';
import { combineLatest, from, Observable, of } from 'rxjs';
import { map, mergeMap, mergeScan, reduce } from 'rxjs/operators';
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
    // private _player: PlayerService
  ){}

  transform( deck: iCard[] ): Observable<boolean> {
    // const deck = this._player.current$.value?.deck
    if ( !deck ) { return of(false)}
    console.log( 'player_deck', deck )
    return from( deck ).pipe(
      mergeMap( card => this._table.avalibleCard$( card ) ),
      mergeScan<boolean, boolean[]>( ( acc, available ) => {
        acc.push( available )
        return of(acc)
      }, [] ),
      map( availables => {
        console.log( availables )
        console.log( availables.some( a => a === true ) )
        return availables.some(a => a === true)
      })
    )
  }

}
