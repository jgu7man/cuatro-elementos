import { MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component( {
  templateUrl: './set-nickname.dialog.html',
  styleUrls: [ './set-nickname.dialog.scss' ]
} )
export class SetNicknameDialog {

  nameCtrl: FormControl = new FormControl( '', [ Validators.required ] );

  constructor (
    public dialog: MatDialogRef<SetNicknameDialog>,
  ) { }

}
