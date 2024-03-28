interface Holiday {
  date: string;
  name: string;
  type: string;
}
export const holidaysForYear = (year: number): Array<Holiday> => {
  return [
    {
      date: `${year}-01-01`,
      name: 'Confraternização mundial',
      type: 'national',
    },
    {
      date: calculateGoodFriday(year),
      name: 'Sexta-feira Santa',
      type: 'national',
    },
    {
      date: calculateEasterSunday(year),
      name: 'Páscoa',
      type: 'national',
    },
    {
      date: `${year}-04-21`,
      name: 'Tiradentes',
      type: 'national',
    },
    {
      date: `${year}-05-01`,
      name: 'Dia do trabalho',
      type: 'national',
    },
    {
      date: calculateCorpusChristi(year),
      name: 'Corpus Christi',
      type: 'national',
    },
    {
      date: `${year}-09-07`,
      name: 'Independência do Brasil',
      type: 'national',
    },
    {
      date: `${year}-10-12`,
      name: 'Nossa Senhora Aparecida',
      type: 'national',
    },
    {
      date: `${year}-11-02`,
      name: 'Finados',
      type: 'national',
    },
    {
      date: `${year}-11-15`,
      name: 'Proclamação da República',
      type: 'national',
    },
    {
      date: `${year}-12-25`,
      name: 'Natal',
      type: 'national',
    },
  ];
};

/**
 * Calcula a data da Páscoa para um ano específico.
 * @param {number} year - O ano para o qual deseja calcular a data da Páscoa.
 * @returns {string} - A data da Páscoa para o ano especificado.
 */
function calculateEasterSunday(year: number): string {
  const goldenNumber: number = year % 19;
  const century: number = Math.floor(year / 100);
  const yearInCentury: number = year % 100;
  const leapCycle: number = Math.floor(century / 4);
  const leapYearCorrection: number = century % 4;
  const epactParameter: number = Math.floor((century + 8) / 25);
  const solarCorrection: number = Math.floor(
    (century - epactParameter + 1) / 3,
  );
  const lunarParameter: number =
    (19 * goldenNumber + century - leapCycle - solarCorrection + 15) % 30;
  const additionalLunarCorrection: number = Math.floor(yearInCentury / 4);
  const additionalSolarCorrection: number = yearInCentury % 4;
  const dayOfTheWeekCorrection: number =
    (32 +
      2 * leapYearCorrection +
      2 * additionalLunarCorrection -
      lunarParameter -
      additionalSolarCorrection) %
    7;
  const solarCycleCorrection: number = Math.floor(
    (goldenNumber + 11 * lunarParameter + 22 * dayOfTheWeekCorrection) / 451,
  );
  const month: number = Math.floor(
    (lunarParameter + dayOfTheWeekCorrection - 7 * solarCycleCorrection + 114) /
      31,
  );
  const day: number =
    ((lunarParameter +
      dayOfTheWeekCorrection -
      7 * solarCycleCorrection +
      114) %
      31) +
    1;

  const formattedMonth: string = month < 10 ? `0${month}` : `${month}`;
  const formattedDay: string = day < 10 ? `0${day}` : `${day}`;

  return `${year}-${formattedMonth}-${formattedDay}`;
}

/**
 * Calcula a data da Sexta-feira Santa para um ano específico.
 * @param {number} year - O ano para o qual deseja calcular a data da Sexta-feira Santa.
 * @returns {string} - A data da Sexta-feira Santa no formato "YYYY-MM-DD".
 */
function calculateGoodFriday(year: number): string {
  const easterDate: string = calculateEasterSunday(year);

  const easter: Date = new Date(easterDate);

  easter.setDate(easter.getDate() - 2);

  const formattedMonth: string =
    easter.getMonth() + 1 < 10
      ? `0${easter.getMonth() + 1}`
      : `${easter.getMonth() + 1}`;
  const formattedDay: string =
    easter.getDate() < 10 ? `0${easter.getDate()}` : `${easter.getDate()}`;

  return `${easter.getFullYear()}-${formattedMonth}-${formattedDay}`;
}

/**
 * Calcula a data do Carnaval (40 dias antes da Páscoa) para um ano específico.
 * @param {number} year - O ano para o qual deseja calcular a data do Carnaval.
 * @returns {string} - A data do Carnaval no formato "YYYY-MM-DD".
 */
function calculateCarnival(year: number): string {
  const easterDate: string = calculateEasterSunday(year);

  const easter: Date = new Date(easterDate);

  easter.setDate(easter.getDate() - 47);

  const formattedMonth: string =
    easter.getMonth() + 1 < 10
      ? `0${easter.getMonth() + 1}`
      : `${easter.getMonth() + 1}`;
  const formattedDay: string =
    easter.getDate() < 10 ? `0${easter.getDate()}` : `${easter.getDate()}`;

  return `${easter.getFullYear()}-${formattedMonth}-${formattedDay}`;
}

/**
 * Calcula a data de Corpus Christi (60 dias após a Páscoa) para um ano específico.
 * @param {number} year - O ano para o qual deseja calcular a data de Corpus Christi.
 * @returns {string} - A data de Corpus Christi no formato "YYYY-MM-DD".
 */
function calculateCorpusChristi(year: number): string {
  const easterDate: string = calculateEasterSunday(year);

  const easter: Date = new Date(easterDate);

  easter.setDate(easter.getDate() + 60);

  const formattedMonth: string =
    easter.getMonth() + 1 < 10
      ? `0${easter.getMonth() + 1}`
      : `${easter.getMonth() + 1}`;
  const formattedDay: string =
    easter.getDate() < 10 ? `0${easter.getDate()}` : `${easter.getDate()}`;

  return `${easter.getFullYear()}-${formattedMonth}-${formattedDay}`;
}
