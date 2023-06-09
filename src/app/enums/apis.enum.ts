// login api url

export const enum LOGIN_API {
  LOGIN_API = '/login',
  FORGOT_PASSWORD_API = '/forgot-password',
  VERIFY_CODE_API = '/verify-code',
  CREATE_NEW_PASSWORD_API = '/create-new-password',
}

// application management route api urls

export const enum APPLICATION_MANAGEMENT_API {
  TOTAL_DATA = '/total-data',
  ADMIN_DATA = '/admin-data',
  SUB_ADMIN_DATA = '/sub-admin-data',
  MODIFY_RIGHTS = '/modify-rights',
  MODIFY_SUB_RIGHTS = '/modify-sub-rights',
  DELETE_SUB_RIGHTS = '/delete-sub-rights',
  SEARCH_DATA = '/search-data',
  POST_DATA = '/post-data',
}

// eservices management route api urls

export const enum ESERVICES_MANAGEMENT_API {
  GET_DATA = '/get-eservices-data',
  SEARCH_DATA = '/search-eservices-data',
  POST_DATA = '/post-eservices-data',
  POST_ROLES = '/post-eservices-roles',
  GET_SINGLE_DATA = '/get-single-eservices-data',
  UPDATE_DATA = '/update-eservices-data',
  UPDATE_ROLES = '/update-eservices-roles',
  GET_ROLES = '/get-roles-lookup',
  GET_SINGLE_ROLE_LOOKUP = '/get-single-role-lookup',
}

// bank company log api urls

export const enum BANK_COMPANY_LOG_API {
  FETCH_BANK_DATA = '/fetch-bank-data',
  SEARCH_BANK_DATA_ENTITY = '/search-bank-data-entity',
  SEARCH_BANK_DATA_DATE = '/search-bank-data-date',
}

// change company object api urls

export const enum CHANGE_COMPANY_OBJECT_API {
  FETCH_ERROR_PROCEED_DATA = '/error-proceeds',
  FETCH_ERROR_PROCESS_DATA = '/error-processes',
  EXPORT_TO_EXCEL = '/export-to-excel',
  DOWNLOAD_EXCEL_FILE = '/download-excel-file',
}

// change company sector api urls

export const enum CHANGE_COMPANY_SECTOR_API {
  FETCH_CTC_REPORT_SUMMARY = '/ctc-table-summary',
  FETCH_CTC_TABLES = '/fetch-ctc-table',
  SEARCH_CTC_REPORT = '/search-ctc-table',
}

// deactivate company api urls

export const enum DEACTIVATE_COMPANY_API {
  FETCH_APPLIED_CTC_TABLE = '/fetch-applied-ctc-table',
}

// features api urls

export const enum FEATURE_API {
  FETCH_DATA_BY_NAME_IN_ESERVICES = '/fetch-data-by-name-in-eservices',
  FETCH_DATA_BY_NUMBER_IN_ESERVICES = '/fetch-data-by-number-in-eservices',
  FETCH_DATA_BY_NAME_IN_ARCHIVE = '/fetch-data-by-name-in-archive',
  FETCH_DATA_BY_NUMBER_IN_ARCHIVE = '/fetch-data-by-number-in-archive',
  FETCH_COMPANIES_LIST = '/get-companies-list',
}

// user rights api urls

export const enum USER_RIGHTS_API {
  FETCH_USER_RIGHTS = '/allow-user-rights',
}

// products api urls

export const enum PRODUCTS_API {
  PROCESS_LIST_BY_COMPANY_NAME = '/search-company-by-name',
  PROCESS_LIST_BY_NUMBER = '/search-company-by-no',
}

// user profile api urls

export const enum USER_PROFILE_API {
  GET_USER_PROFILE = '/get-profile',
  UPDATE_USER_PROFILE = '/update-profile',
  UPDATE_IMAGE = '/update-image',
  GET_PROFILE_PHOTO = '/get-profile-photo',
}

// request logs api

export const enum REQUEST_LOG_API {
  GET_LOG_REQUESTS = '/get-log-requests',
  POST_LOG_REQUESTS = '/post-log-requests',
  DELETE_LOG_REQUESTS = '/delete-log-requests',
}

// combined ctc report api

export const enum COMBINED_CTC_REPORT_API {
  FETCH_CTC_REPORT = '/combined-ctc-report',
}

// bank usage report api

export const enum BANK_USAGE_REPORT_API {
  FETCH_BANK_USAGE_REPORT = '/get-bank-usage-report',
}

// data sharing monitoring report

export const enum DATA_SHARING_REPORT_API {
  FETCH_DATA_SHARING_REPORT = '/get-data-sharing-report',
}

// IOSCO Alerts API

export const enum IOSCO_ALERTS_API {
  GET_IOSCO_ALERTS = '/get-iosco-alerts',
  UPLOAD_IOSCO_ALERTS = '/upload-iosco-alerts',
  DELETE_IOSCO_ALERT = '/delete-iosco-alert',
  DOWNLOAD_IOSCO_ALERT = '/download-iosco-alert',
  DOWNLOAD_EXCEL_TEMPLATE = '/download-excel-template',
}