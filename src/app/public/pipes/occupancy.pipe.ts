import { Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { iTable } from '../models/table.model';

@Pipe({
  name: 'occupancy'
})
export class OccupancyPipe implements PipeTransform {

  constructor (
    private _afs: AngularFirestore,
  ){}

  transform(table: iTable, ...args: unknown[]): Observable<number> {
    return this._afs.collection<iTable>
      ( `tables/${ table.id }/${ table.currentRound }` )
      .valueChanges().pipe(
        map( players => players.length || 0 )
      );
  }

}
