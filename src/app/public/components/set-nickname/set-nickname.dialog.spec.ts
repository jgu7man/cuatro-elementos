import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetNicknameDialog } from './set-nickname.dialog';

describe('SetNicknameDialog', () => {
  let component: SetNicknameDialog;
  let fixture: ComponentFixture<SetNicknameDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetNicknameDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetNicknameDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
