import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerService } from '../services/player.service';

@Pipe({ name: 'areIn' })
export class AreInPipe implements PipeTransform {
  constructor(private _player: PlayerService) {}

  /**
   * Check if the player are in the table
   * @param {string} tid The table id
   * @returns {*}  {Observable<boolean>} true if is in the table
   */
  transform(tid: string, ...args: unknown[]): Observable<boolean> {
    return this._player.current$.pipe(
      // tap(value => console.log( value )),
      map((player) => player?.tableId === tid)
      // tap(value => console.log( value ))
    );
  }
}
