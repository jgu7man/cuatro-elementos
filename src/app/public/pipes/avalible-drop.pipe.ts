import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { iCard } from '../models/table.model';
import { PlayerService } from '../services/player.service';
import { TableService } from '../services/table.service';

@Pipe( {
  name: 'avaliableDrop',
  pure: true
} )
export class AvalibleDropPipe implements PipeTransform {

  constructor (
    private _table: TableService,
    private _player: PlayerService
  ) { }

  transform( deck: iCard[] ): Observable<boolean> {
    return this._table.currentDeck$.pipe(
      map( () => {
        // console.log( deck )
        // console.log( this._player.current$.value?.deck )
        if ( !deck ) { return false }
        if ( this._table.table.currentRound.winner ) return false

        const availables = deck.map( card => this._table.allowedCard( card ) )
        // console.log( availables )
        return availables.some( a => a === true )
      })
      )


  }




}
