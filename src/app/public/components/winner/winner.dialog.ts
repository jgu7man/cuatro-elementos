import { Observable, of } from 'rxjs';
import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { iPlayer, PlayerModel } from '../../models/player.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';

@Component({
  templateUrl: './winner.dialog.html',
  styleUrls: ['./winner.dialog.scss']
})
export class WinnerDialog implements OnInit {

  public player: Observable<PlayerModel | undefined>
  constructor (
    @Inject( MAT_DIALOG_DATA ) public pid: string = '',
    public dialog: MatDialogRef<WinnerDialog>,
    public location: Location,
    private _afs: AngularFirestore
  ) {
    this.player = this._afs.collection<PlayerModel>( 'players',
      ref => ref.where( 'id', '==', this.pid ) )
      .get().pipe(
        switchMap( players => players.empty
          ? of( undefined )
          : of(players.docs[0].data())
        )
      )

  }

  async ngOnInit() {
  }

}
