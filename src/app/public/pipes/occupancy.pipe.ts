import { Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { iTablePlayer } from '../models/player.model';
import { iTable } from '../models/table.model';

@Pipe({
  name: 'occupancy'
})
export class OccupancyPipe implements PipeTransform {

  constructor (
    private _afs: AngularFirestore,
  ){}

  transform( table: iTable, ...args: unknown[] ): Observable<number> {
    console.log( 'called' )
    return this._afs.collectionGroup<iTablePlayer>
      ( `players`, ref => ref.where('tableId', '==', table.id) )
      .valueChanges().pipe(
        map( players => players.length || 0 )
      );
  }

}
