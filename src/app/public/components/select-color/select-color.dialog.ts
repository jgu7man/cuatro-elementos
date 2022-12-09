import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  templateUrl: './select-color.dialog.html',
  styleUrls: ['./select-color.dialog.scss'],
})
export class SelectColorDialog {
  /**
   * Catch the color selected
   * @type {FormControl}
   */
  colorCtrl: FormControl = new FormControl(null);
  constructor(
    private _dialog: MatDialogRef<SelectColorDialog>,
    @Inject(MAT_DIALOG_DATA) public tid: string
  ) {}

  /**
   * Catch the color selected event
   * @param {MatRadioChange} event
   */
  onColorSelected(event: MatRadioChange) {
    this._dialog.close(event.value);
  }
}
