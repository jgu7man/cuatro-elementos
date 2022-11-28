import { iPlayer } from "./player.model";
import firebase from 'firebase/app'
export type Moment = firebase.firestore.Timestamp | Date;

export class TableModel {
  readonly id: string;
  readonly created: Date | firebase.firestore.Timestamp

  public deck?: iCard[]
  public droppedDeck: iCard[] = []
  public started: boolean = false
  public currentRound: Round

  public clockDirection: boolean = true
  public colorSelected?: ColorType
  public rounds: Round[] = []

  constructor (
  ) {
    this.id = Math.random().toString( 36 ).substring( 4 )
    this.created = new Date()
    this.currentRound = {
      id: this.created.getTime(),
      lastMovement: this.created,
      winner: ''
    }
    this.rounds.push( this.currentRound )
  }
}

export interface Round {
  id: number;
  lastMovement: Moment,
  winner: string
}

export interface iTable extends TableModel {
  created: Moment
}

export type ColorType = 'red' | 'grn' | 'blu' | 'ylw' | 'blk'

export interface iCard {
  id: string,
  color: ColorType,
  value: CardValue
}

export type CardValue = 'n0' | 'n1' | 'n2' | 'n3' | 'n4' | 'n5' | 'n6' | 'n7' | 'n8' | 'n9' | 'bl' | 'tu' | '+2' | '+4' | 'ch'
export const cardValueMap: Map<CardValue, number> = new Map( [
  ['n0' , 0],
  ['n1' , 1],
  ['n2' , 2],
  ['n3' , 3],
  ['n4' , 4],
  ['n5' , 5],
  ['n6' , 6],
  ['n7' , 7],
  ['n8' , 8],
  ['n9' , 9],
  ['+2' , 10],
  ['+4' , 11],
  ['bl' , 12],
  ['tu' , 13],
  ['ch' , 14]
])

export const Deck: iCard[] = [
  {value: 'n0', color: 'red', id: '000r3dn0'},
  {value: 'n1', color: 'red', id: '001r3dn1'},
  {value: 'n1', color: 'red', id: '002r3dn1'},
  {value: 'n2', color: 'red', id: '003r3dn2'},
  {value: 'n2', color: 'red', id: '004r3dn2'},
  {value: 'n3', color: 'red', id: '005r3dn3'},
  {value: 'n3', color: 'red', id: '006r3dn3'},
  {value: 'n4', color: 'red', id: '007r3dn4'},
  {value: 'n4', color: 'red', id: '008r3dn4'},
  {value: 'n5', color: 'red', id: '009r3dn5'},
  {value: 'n5', color: 'red', id: '010r3dn5'},
  {value: 'n6', color: 'red', id: '011r3dn6'},
  {value: 'n6', color: 'red', id: '012r3dn6'},
  {value: 'n7', color: 'red', id: '013r3dn7'},
  {value: 'n7', color: 'red', id: '014r3dn7'},
  {value: 'n8', color: 'red', id: '015r3dn8'},
  {value: 'n8', color: 'red', id: '016r3dn8'},
  {value: 'n9', color: 'red', id: '017r3dn9'},
  {value: 'n9', color: 'red', id: '018r3dn9'},
  {value: 'bl', color: 'red', id: '019r3dbl'},
  {value: 'bl', color: 'red', id: '020r3dbl'},
  {value: 'tu', color: 'red', id: '021r3dtr'},
  {value: 'tu', color: 'red', id: '022r3dtr'},
  {value: '+2', color: 'red', id: '023r3d+2'},
  {value: '+2', color: 'red', id: '024r3d+2'},

  {value: 'n0', color: 'blu', id: '025b1un0'},
  {value: 'n1', color: 'blu', id: '026b1un1'},
  {value: 'n1', color: 'blu', id: '027b1un1'},
  {value: 'n2', color: 'blu', id: '028b1un2'},
  {value: 'n2', color: 'blu', id: '029b1un2'},
  {value: 'n3', color: 'blu', id: '030b1un3'},
  {value: 'n3', color: 'blu', id: '031b1un3'},
  {value: 'n4', color: 'blu', id: '032b1un4'},
  {value: 'n4', color: 'blu', id: '033b1un4'},
  {value: 'n5', color: 'blu', id: '034b1un5'},
  {value: 'n5', color: 'blu', id: '035b1un5'},
  {value: 'n6', color: 'blu', id: '036b1un6'},
  {value: 'n6', color: 'blu', id: '037b1un6'},
  {value: 'n7', color: 'blu', id: '038b1un7'},
  {value: 'n7', color: 'blu', id: '039b1un7'},
  {value: 'n8', color: 'blu', id: '040b1un8'},
  {value: 'n8', color: 'blu', id: '041b1un8'},
  {value: 'n9', color: 'blu', id: '042b1un9'},
  {value: 'n9', color: 'blu', id: '043b1un9'},
  {value: 'bl', color: 'blu', id: '044b1ubl'},
  {value: 'bl', color: 'blu', id: '045b1ubl'},
  {value: 'tu', color: 'blu', id: '046b1utr'},
  {value: 'tu', color: 'blu', id: '047b1utr'},
  {value: '+2', color: 'blu', id: '048b1u+2'},
  {value: '+2', color: 'blu', id: '049b1u+2'},

  {value: 'n0', color: 'grn', id: '050gr3n0'},
  {value: 'n1', color: 'grn', id: '051gr3n1'},
  {value: 'n1', color: 'grn', id: '052gr3n1'},
  {value: 'n2', color: 'grn', id: '053gr3n2'},
  {value: 'n2', color: 'grn', id: '054gr3n2'},
  {value: 'n3', color: 'grn', id: '055gr3n3'},
  {value: 'n3', color: 'grn', id: '056gr3n3'},
  {value: 'n4', color: 'grn', id: '057gr3n4'},
  {value: 'n4', color: 'grn', id: '058gr3n4'},
  {value: 'n5', color: 'grn', id: '059gr3n5'},
  {value: 'n5', color: 'grn', id: '060gr3n5'},
  {value: 'n6', color: 'grn', id: '061gr3n6'},
  {value: 'n6', color: 'grn', id: '062gr3n6'},
  {value: 'n7', color: 'grn', id: '063gr3n7'},
  {value: 'n7', color: 'grn', id: '064gr3n7'},
  {value: 'n8', color: 'grn', id: '065gr3n8'},
  {value: 'n8', color: 'grn', id: '066gr3n8'},
  {value: 'n9', color: 'grn', id: '067gr3n9'},
  {value: 'n9', color: 'grn', id: '068gr3n9'},
  {value: 'bl', color: 'grn', id: '069gr3bl'},
  {value: 'bl', color: 'grn', id: '070gr3bl'},
  {value: 'tu', color: 'grn', id: '071gr3tr'},
  {value: 'tu', color: 'grn', id: '072gr3tr'},
  {value: '+2', color: 'grn', id: '073gr3+2'},
  {value: '+2', color: 'grn', id: '074gr3+2'},

  {value: 'n0', color: 'ylw', id: '075y3ln0'},
  {value: 'n1', color: 'ylw', id: '076y3ln1'},
  {value: 'n1', color: 'ylw', id: '077y3ln1'},
  {value: 'n2', color: 'ylw', id: '078y3ln2'},
  {value: 'n2', color: 'ylw', id: '079y3ln2'},
  {value: 'n3', color: 'ylw', id: '080y3ln3'},
  {value: 'n3', color: 'ylw', id: '081y3ln3'},
  {value: 'n4', color: 'ylw', id: '082y3ln4'},
  {value: 'n4', color: 'ylw', id: '083y3ln4'},
  {value: 'n5', color: 'ylw', id: '084y3ln5'},
  {value: 'n5', color: 'ylw', id: '085y3ln5'},
  {value: 'n6', color: 'ylw', id: '086y3ln6'},
  {value: 'n6', color: 'ylw', id: '087y3ln6'},
  {value: 'n7', color: 'ylw', id: '088y3ln7'},
  {value: 'n7', color: 'ylw', id: '089y3ln7'},
  {value: 'n8', color: 'ylw', id: '090y3ln8'},
  {value: 'n8', color: 'ylw', id: '091y3ln8'},
  {value: 'n9', color: 'ylw', id: '092y3ln9'},
  {value: 'n9', color: 'ylw', id: '093y3ln9'},
  {value: 'bl', color: 'ylw', id: '094y3lbl'},
  {value: 'bl', color: 'ylw', id: '095y3lbl'},
  {value: 'tu', color: 'ylw', id: '096y3ltr'},
  {value: 'tu', color: 'ylw', id: '097y3ltr'},
  {value: '+2', color: 'ylw', id: '098y3l+2'},
  {value: '+2', color: 'ylw', id: '099y3l+2'},

  {value: '+4', color: 'blk', id: '100b1k+4'},
  {value: '+4', color: 'blk', id: '101b1k+4'},
  {value: '+4', color: 'blk', id: '102b1k+4'},
  {value: '+4', color: 'blk', id: '103b1k+4'},
  {value: 'ch', color: 'blk', id: '104b1kch'},
  {value: 'ch', color: 'blk', id: '105b1kch'},
  {value: 'ch', color: 'blk', id: '106b1kch'},
  {value: 'ch', color: 'blk', id: '107b1kch'},


]
