import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { COUNTRIES } from '../../../settings/cleansing.settings';

@Component({
  selector: 'app-officers-information',
  templateUrl: './officers-information.component.html',
  styleUrls: ['./officers-information.component.css']
})
export class OfficersInformationComponent implements OnInit {

  officersInformationForm: FormGroup;
  readonly countriesList = COUNTRIES;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.officersInformationForm = this.formBuilder.group({

      // CEO Details
      ceoName: ['', [Validators.required]],
      ceoCnic: ['', [Validators.required]],
      ceoAddress: ['', [Validators.required]],
      ceoCountry: ['', [Validators.required]],
      ceoFatherName: ['', [Validators.required]],
      ceoAppointmentDate: ['', [Validators.required]],
      ceoCellNo: ['', [Validators.required]],
      ceoQualification: ['', [Validators.required]],
      ceoExperience: ['', [Validators.required]],
      ceoOtherBusiness: ['', [Validators.required]],
      ceoFax: ['', [Validators.required]],
      ceoTelephoneNo: ['', [Validators.required]],

      // Chief Accountant Details
      chiefName: ['', [Validators.required]],
      chiefCnic: ['', [Validators.required]],
      chiefAddress: ['', [Validators.required]],
      chiefCountry: ['', [Validators.required]],
      chiefFatherName: ['', [Validators.required]],
      chiefAppointmentDate: ['', [Validators.required]],

      // Legal Advisor Details
      advisorName: ['', [Validators.required]],
      advisorCnic: ['', [Validators.required]],
      advisorAddress: ['', [Validators.required]],
      advisorCountry: ['', [Validators.required]],
      advisorFatherName: ['', [Validators.required]],
      advisorAppointmentDate: ['', [Validators.required]],

      // Managing Agent Details
      agentName: ['', [Validators.required]],
      agentCnic: ['', [Validators.required]],
      agentAddress: ['', [Validators.required]],
      agentCountry: ['', [Validators.required]],
      agentFatherName: ['', [Validators.required]],
      agentAppointmentDate: ['', [Validators.required]],

      // Secretary details
      secretaryName: ['', [Validators.required]],
      secretaryCnic: ['', [Validators.required]],
      secretaryAddress: ['', [Validators.required]],
      secretaryCountry: ['', [Validators.required]],
      secretaryFatherName: ['', [Validators.required]],
      secretaryAppointmentDate: ['', [Validators.required]],
    })
  }

}
