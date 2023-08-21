import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, AfterViewInit {
  @ViewChild('modalButton') modalButton: ElementRef<HTMLInputElement>;
  @Output() closeModalEvent = new EventEmitter<boolean>();
  informationForm: FormGroup;
  formToLoad: string;
  hideElement = false;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.formToLoad = this.router.url.split('/')[4];
  }

  ngOnInit(): void {
    this.createInformationForm();
    this.formToLoad === 'directors-information'
      ? (this.hideElement = false)
      : (this.hideElement = true);
  }

  createInformationForm() {
    this.informationForm = this.formBuilder.group({
      designation: ['', [Validators.required]],
      address: ['', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      cnicPassport: ['', [Validators.required]],
      fatherHusbandName: ['', [Validators.required]],
      NTN: ['', [Validators.required]],
      name: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      nature: ['', [Validators.required]],
      entityNominatingDirector: ['', [Validators.required]],
      noOfShares: ['', [Validators.required]],
      otherOccupation: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
  }

  ngAfterViewInit(): void {
    this.modalButton.nativeElement.click();
  }

  closeModal() {
    this.closeModalEvent.emit(false);
  }
}
