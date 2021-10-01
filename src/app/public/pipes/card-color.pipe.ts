import { Pipe, PipeTransform } from '@angular/core';
import { iCard } from '../components/table/table.model';

@Pipe({
  name: 'cardColor'
})
export class CardColorPipe implements PipeTransform {

  transform( card: iCard, ...args: unknown[] ): string {
    let color: string = ''
    switch (card.color) {
      case 'blk': color = '#202020'
        break;
      case 'blu': color = '#0059b1'
        break;
      case 'grn': color = '#347c2a'
        break;
      case 'red': color = '#d20019'
        break;
      case 'ylw': color = '#d8c100'
    }
    return color
  }

}
