export function formatDateToYYYYMMDD(inputDate: string[]): string[] {
  const newDateFormat = [];

  inputDate.forEach((item) => {
    if (item) {
      const delimiter = item.includes('/') ? '/' : '-';
      const newItem = item.split(delimiter);

      const day = newItem[0];
      const month = newItem[1];
      const year = newItem[2];

      newDateFormat.push(`${year}-${month}-${day}`);
    } else {
      newDateFormat.push(null);
    }
  });

  return newDateFormat;
}

export function formatDateToDDMMYYYY(inputDate: string[]): string[] {
  const newDateFormat = [];

  inputDate.forEach((item) => {
    if (item) {
      const delimiter = item.includes('/') ? '/' : '-';
      const newItem = item.split(delimiter);

      const year = newItem[0];
      const month = newItem[1];
      const day = newItem[2];

      newDateFormat.push(`${day}/${month}/${year}`);
    } else {
      newDateFormat.push(null);
    }
  });

  return newDateFormat;
}

export function getUserId() {
  return sessionStorage.getItem('cookie').split('@')[0];
}

export function convertToTitleCase(input: string) {
  const words = input.split(' ');
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(' ');
}