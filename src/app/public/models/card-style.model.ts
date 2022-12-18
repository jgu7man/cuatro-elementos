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


