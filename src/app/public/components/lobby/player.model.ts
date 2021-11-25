import firebase from 'firebase/app'
import { iCard } from '../table/table.model'

export class PlayerModel {
  deck: iCard[]
  current: boolean = false
  constructor(
    public nick: string,
  ) {
    this.deck = []
  }
}

export interface iPlayer {
  nick: string,
  ingresed: Date | firebase.firestore.Timestamp,
  uid: string,
}
