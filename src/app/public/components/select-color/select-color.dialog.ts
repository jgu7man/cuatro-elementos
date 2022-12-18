import { ColorChoice } from './../../models/colors.model';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ColorsMap } from '../../theme';

@Component({
  templateUrl: './select-color.dialog.html',
  styleUrls: ['./select-color.dialog.scss'],
})
export class SelectColorDialog {
  colorMap = ColorsMap
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

  get RED() { return this.colorMap.get(ColorChoice.RED) }
  get BLUE() { return this.colorMap.get(ColorChoice.BLUE) }
  get GREEN() { return this.colorMap.get(ColorChoice.GREEN) }
  get YELLOW() { return this.colorMap.get(ColorChoice.YELLOW) }
}
