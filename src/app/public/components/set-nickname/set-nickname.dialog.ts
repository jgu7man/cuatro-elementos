import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component( {
  templateUrl: './set-nickname.dialog.html',
  styleUrls: [ './set-nickname.dialog.scss' ]
} )
export class SetNicknameDialog implements OnInit {

  nameCtrl: FormControl = new FormControl('', [Validators.required]);
  constructor (

  ) { }

  ngOnInit(): void {
  }

}
