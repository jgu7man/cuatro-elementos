import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { iCard } from '../components/table/table.model';
import { TableService } from '../services/table.service';

@Pipe({
  name: 'avalibleCard'
})
export class AvalibleCardPipe implements PipeTransform {

  constructor (
    private _table: TableService,
  ){}

  transform( card: iCard ): Observable<boolean> {
    return this._table.current$.pipe(
      map( table => {
        const last = table?.droppedDeck[table.droppedDeck.length -1]
        if ( !last ) return true
        else {
          return ( last.color === card.color || last.value === card.value ) ||
            (card.color === 'blk' || card.color === this._table.colorSelected)
        }

      })
    )
  }

}
