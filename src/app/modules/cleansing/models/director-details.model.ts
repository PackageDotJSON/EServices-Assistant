export interface ISingleDirector {
  designation: string;
  directorAddress: string;
  directorAppointmentDate: string;
  directorCnicPassport: string;
  directorFatherHusbandName: string;
  directorNTN: string;
  directorName: string;
  directorNationality: string;
  directorshipNature?: string;
  entityNominatingDirector?: string;
  noOfShares?: string;
  otherOccupation: string;
  status: string;
}

export interface IDirectorDetails extends ISingleDirector {
  key: string;
  compIncNo: string;
  directorInfo: ISingleDirector[];
  message: string;
  timestamp: string;
  userId: string;
}
