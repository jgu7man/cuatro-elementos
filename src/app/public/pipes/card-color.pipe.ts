import { Pipe, PipeTransform } from '@angular/core';
import { ColorType, iCard } from '../models/table.model';

@Pipe({
  name: 'cardColor'
})
export class CardColorPipe implements PipeTransform {

  transform( cardColor: ColorType, ...args: ('color' | 'name')[] ): string {
    const tag = args[0]
    let color: string = ''

    switch (cardColor) {
      case 'blk': color = tag == 'color' ? '#202020' : 'Negro'
        break;
      case 'blu': color = tag == 'color' ? '#0059b1' : 'Agua'
        break;
      case 'grn': color = tag == 'color' ? '#347c2a' : 'Tierra'
        break;
      case 'red': color = tag == 'color' ? '#d20019' : 'Fuego'
        break;
      case 'ylw': color = tag == 'color' ? '#d8c100' : 'Aire'
    }
    return color
  }

}
