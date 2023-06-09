import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IResponse } from '../../models/response.model';
import { AlertsService } from '../../services/alerts.service';
import { DownloadFileService } from '../../services/download-file.service';
import { USER_ID, ALERT_FILE_SETTINGS } from '../../settings/alerts.settings';
import { ValidateFile } from '../../validators/file.validator';

@Component({
  selector: 'app-upload-sheet-card',
  templateUrl: './upload-sheet-card.component.html',
  styleUrls: ['./upload-sheet-card.component.css'],
})
export class UploadSheetCardComponent implements OnInit, OnDestroy {
  sheetForm: FormGroup;
  subscription = new Subscription();
  alertResponse$: Observable<IResponse>;
  isRequestSent = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertsService,
    private downloadFileService: DownloadFileService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.sheetForm = this.formBuilder.group({
      sheetType: ['', [Validators.required]],
      sheetUpload: [null, [Validators.required, ValidateFile]],
      sheetDescription: [
        null,
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(150),
        ],
      ],
      uploadedBy: [USER_ID],
    });
  }

  handleFileInput(file: File) {
    this.sheetForm.patchValue({
      sheetUpload: file,
    });
  }

  uploadSheet() {
    this.isRequestSent = true;
    const formData = new FormData();

    Object.keys(this.sheetForm.controls).forEach((key) => {
      formData.append(key, this.sheetForm.get(key).value);
    });

    this.alertResponse$ = this.alertService.uploadSheet(formData).pipe(
      tap((res) => {
        if (res) {
          this.isRequestSent = false;
        }
      })
    );
    this.createForm();
  }

  downloadExcelTemplate() {
    this.isRequestSent = true;

    this.subscription.add(
      this.alertService
        .downloadTemplate()
        .pipe(
          tap((res: Blob) => {
            this.downloadFileService.downloadFileToDesktop(
              res,
              ALERT_FILE_SETTINGS.TYPE
            );
            this.isRequestSent = false;
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
