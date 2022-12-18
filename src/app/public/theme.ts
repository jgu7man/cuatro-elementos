import { CardStyleModel } from "./models/card-style.model";
import { CardColorDefinition, ColorChoice } from "./models/colors.model";

/**
 * Colors for the cards
 * @type {*}
 */
export const ColorsMap: Map<ColorChoice, CardColorDefinition> = new Map([
  [ColorChoice.BLACK, { color: '#202020', label: 'No selected', constrast: '#ffffff' }],
  [ColorChoice.BLUE, { color: '#179af3', label: 'Azul', constrast: '#ffffff' }],
  [ColorChoice.GREEN, { color: '#9cba39', label: 'Verde', constrast: '#ffffff' }],
  [ColorChoice.RED, { color: '#fd4e52', label: 'Rojo', constrast: '#ffffff' }],
  [ColorChoice.YELLOW, { color: '#ffb22d', label: 'Amarillo', constrast: '#000000' }],
]);

export const defaultCardStyles: CardStyleModel = {
  card: {
    border: 'solid 3px #fff'
  },
  cardValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 'x-large',
    textShadow: '-4px -1px rgba(0, 0, 0)'
  },
  bigValueContainer: {
    borderRadius: 'none',
    background: 'none',
    boxShadow: 'none'
  },
  bigValue: {
    fontWeight: 'bold',
    fontSize: 'absolute',
    color: '#fff',
    textShadow: '-3px 3px 3px black, 1px 1px 7px black, -3px -1px 1px black',
  },
}
