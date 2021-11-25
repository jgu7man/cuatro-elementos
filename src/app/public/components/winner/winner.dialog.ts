import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { iPlayer } from '../lobby/player.model';

@Component({
  templateUrl: './winner.dialog.html',
  styleUrls: ['./winner.dialog.scss']
})
export class WinnerDialog implements OnInit {

  constructor (
    @Inject( MAT_DIALOG_DATA ) public winner: iPlayer,
    public dialog: MatDialogRef<WinnerDialog>,
    public location: Location
  ) { }

  ngOnInit(): void {
  }

}
