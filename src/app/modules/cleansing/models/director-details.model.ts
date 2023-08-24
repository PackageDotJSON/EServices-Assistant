export interface ISingleDirector {
  directorAddress: string;
  directorCnicPassport: string;
  directorFatherHusbandName: string;
  directorName: string;
  directorNationality: string;
  
  directorNumberOfShares?: string;  
  designation?: string;
  directorAppointmentDate?: string;
  directorNTN?: string;
  directorshipNature?: string;
  entityNominatingDirector?: string;
  otherOccupation?: string;
  status?: string;
  directorCity?: string;
  directorValueOfShares?: string;
  directorClassOfShares?: string;
}

export interface IDirectorDetails extends ISingleDirector {
  key: string;
  compIncNo: string;
  directorInfo: ISingleDirector[];
  message: string;
  timestamp: string;
  userId: string;
}
