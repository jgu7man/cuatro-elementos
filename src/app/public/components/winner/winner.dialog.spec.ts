import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerDialog } from './winner.dialog';

describe('WinnerDialog', () => {
  let component: WinnerDialog;
  let fixture: ComponentFixture<WinnerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WinnerDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
