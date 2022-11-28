import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PlayerService } from '../services/player.service';

@Pipe({
  name: 'areIn'
})
export class AreInPipe implements PipeTransform {

  constructor (
    private _player: PlayerService
  ) { }

  transform(tid: string, ...args: unknown[]): Observable<boolean> {
    return this._player.current$.pipe(
      // tap(value => console.log( value )),
      map( player => player?.tableId === tid ),
      // tap(value => console.log( value ))
    );
  }

}
