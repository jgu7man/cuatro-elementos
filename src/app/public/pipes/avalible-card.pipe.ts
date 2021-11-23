import { Pipe, PipeTransform } from '@angular/core';
import { iCard } from '../components/table/table.model';

@Pipe({
  name: 'avalibleCard'
})
export class AvalibleCardPipe implements PipeTransform {

  transform( card: iCard, ...dropped: (iCard[])[] ): unknown {
    console.log( card, dropped )
    return null;
  }

}
