import { ALERT_FILE_SETTINGS } from '../settings/alerts.settings';

export function ValidateFile(control: any): { [key: string]: boolean } | null {
  const value = control.value;
  const file = control?.nativeElement?.files[0];

  if (!value) {
    return null;
  }

  return value.length < 0 ||
    file.type !== ALERT_FILE_SETTINGS.TYPE ||
    file.size > ALERT_FILE_SETTINGS.MAX_SIZE ||
    file.size <= ALERT_FILE_SETTINGS.MIN_SIZE ||
    file.name.length > ALERT_FILE_SETTINGS.NAME_LENGTH
    ? { invalidFile: true }
    : null;
}
