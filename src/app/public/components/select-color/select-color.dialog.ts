import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  templateUrl: './select-color.dialog.html',
  styleUrls: ['./select-color.dialog.scss']
})
export class SelectColorDialog implements OnInit {

  colorCtrl: FormControl = new FormControl(null)
  constructor (
    private _dialog: MatDialogRef<SelectColorDialog>
  ) { }

  ngOnInit(): void {
  }

  onColorSelected(event: MatRadioChange) {
    this._dialog.close(event.value)
  }

}
