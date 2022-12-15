export interface CardStyleModel {
  card: CardStyle;
  cardValue: CardValueStyle;
  bigValueContainer: BigValueContainerStyle;
  bigValue: BigValueStyle
}

export interface CardStyle {
  border: string;
}

export interface CardValueStyle {
  color: string;
  fontWeight: string;
  fontSize: string;
  textShadow: string;
}

export interface BigValueContainerStyle {
  borderRadius: string;
  background: string;
  boxShadow: string;
}

export interface BigValueStyle {
  fontWeight: string;
  fontSize: string;
  color: string;
  textShadow: string;
}

export type CardElementStyle =
  | CardStyle
  | CardValueStyle
  | BigValueContainerStyle
  | BigValueStyle

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
