import { environment } from 'src/environments/environment';

export const [BASE_URL, INITIAL_LOADING_TIME, DATA_CLEANSING_KEY, DATA_CLEANSING_BASE_URL] = [
  environment.baseUrl,
  environment.loadingTime,
  environment.dataCleansingKey,
  environment.dataCleansingUrl
];
