import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TablePlayer } from '../models/player.model';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'areIn'
})
export class AreInPipe implements PipeTransform {

  constructor (
    private _table: TableService
  ) { }
  
  transform(player: TablePlayer, ...args: unknown[]): Observable<boolean> {
    return this._table.players$.pipe(
      map( players => players.some( p => p.id === player.id ) )
    );
  }

}
