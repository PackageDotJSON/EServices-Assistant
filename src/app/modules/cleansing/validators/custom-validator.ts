import { AbstractControl, ValidatorFn } from '@angular/forms';

export function optionExistsValidator(options: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const selectedValue = control.value;
    if (!options.includes(selectedValue)) {
      return { optionNotExists: true };
    }
    return null;
  };
}
