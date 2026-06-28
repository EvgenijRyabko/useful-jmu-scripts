import { ExcelTable } from '../../utils/excel.fileGenerator.js';
import {
  dangerCell,
  defaultCell,
  defaultHeader,
  requiredCell,
  requiredHeader,
} from '../../utils/excel.styles.js';
import { headers } from './keys/headers.js';
import { tandemDataKeys } from './keys/tandemKeys.js';

const reportDataKeys = {
  gender: 7,
  birthPlace: 9,
  recordBook: 28,
  group: 39,
  enrollDate: 40,
  enrollOrder: 42,
  deductDate: 22,
  graduationDate: 21,
};

const RESULT_COLS = {
  lastname: 1,
  firstname: 2,
  middlename: 3,
  birthday: 8,
  documentRussia: 10,
  russiaIssuedDate: 13,
  russiaSeries: 11,
  russiaNumber: 12,
  documentOther: 15,
  otherSeries: 16,
  otherNumber: 17,
  otherIssuedDate: 20,
  snils: 14,
  qualificationText: 26,
  qualificationCode: 27,
  enrollOrderDate1: 29,
  course: 30,
  studyYear: 31,
  eduName: 32,
  eduCode: 33,
  enrollOrderDate2: 41,
  eduProgram: 34,
  studyPeriod: 37,
  studyForm: 38,
  studyBegin: 36,
  studyEnd: 50,
  studyPeriod2: 43,
  financing: 44,
  typePlaces: 45,
  sendToGir: 61,
};

/**
 *
 * @param {typeof tandemDataKeys} keysObject
 * @param {import('exceljs').Worksheet[]} workSheets
 * @returns {{
 *  keysObject: typeof tandemDataKeys;
 *  headerRow: { [key: string]: number };
 *  errors: { fieldName: string }[];
 *  warns: { fieldName: string }[];
 * }}
 */
const checkKeysPositions = async (keysObject, workSheets) => {
  const headersRow = {};
  const mockKeysObject = { ...keysObject };
  const errors = [];
  const warns = [];

  for (const key in keysObject) {
    const sheet = workSheets.find((obj) => obj.name === keysObject[key].listName);

    if (!headersRow[sheet.name]) {
      sheet.eachRow((row) => {
        if (row.getCell(1).value === '№') {
          headersRow[sheet.name] = row.number;
          return;
        }
      });
    }

    const row = sheet.getRow(headersRow[sheet.name]);

    row.eachCell((cell, colNumber) => {
      if (cell.value === keysObject[key].name) {
        mockKeysObject[key].position = colNumber;
        return;
      }
    });

    if (!mockKeysObject[key].position) {
      const name = keysObject[key].name;

      keysObject[key].required ? errors.push({ fieldName: name }) : warns.push({ fieldName: name });
    }
  }

  return { keysObject: mockKeysObject, headersRow, errors, warns };
};

const fillReportHeaders = (sheet, headers) => {
  const row = sheet.getRow(1);

  for (const header of headers) {
    sheet.getColumn(header.position).width = 25;

    const cell = row.getCell(header.position);

    cell.value = header.name;
    cell.style = header.required ? requiredHeader : defaultHeader;
  }
};

const getValidationByHeader = (headerName) => {
  return headers.find((el) => el.name === headerName)?.dataValidation;
};

const fillCell = (cell, opts) => {
  for (const key in opts) {
    cell[key] = opts[key];
  }
};

const getAge = (dateString) => {
  const [day, month, year] = dateString.split('.').map(Number);

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
};

const levelObj = Object.freeze({
  бакалавриат: 'Высшее - бакалавриат',
  магистратура: 'Высшее - магистратура',
  специалитет: 'Высшее - специалитет',
  спо: 'Среднее профессиональное',
  аспирантура: 'Высшее - подготовка кадров высокой квалификации',
});

const levelCodeObj = Object.freeze({
  бакалавриат: '09',
  специалитет: '10',
  магистратура: '11',
  спо: '03',
  аспирантура: '12',
});

const handlers = {
  fio: (cell, row, ctx) => {
    ctx.snils.fio = cell.value;

    const [ln = '', fn = '', mn = ''] = String(cell.value ?? '')
      .trim()
      .split(/\s+/);

    const lastnameCell = row.getCell(RESULT_COLS.lastname);
    const firstnameCell = row.getCell(RESULT_COLS.firstname);
    const middlenameCell = row.getCell(RESULT_COLS.middlename);

    fillCell(lastnameCell, { value: ln, style: requiredCell });
    fillCell(firstnameCell, { value: fn, style: requiredCell });
    fillCell(middlenameCell, { value: mn, style: defaultCell });
  },

  birthday: (cell, row, ctx) => {
    const age = getAge(cell.value);

    fillCell(row.getCell(RESULT_COLS.birthday), {
      value: cell.value,
      style: requiredCell,
    });

    ctx.age = age;
  },

  gender: (cell, row, ctx) => {
    const genderCell = row.getCell(reportDataKeys.gender);
    const value = cell.value === 'М' ? 'Муж' : 'Жен';

    ctx.gender = value;

    fillCell(genderCell, {
      value,
      style: requiredCell,
      dataValidation: getValidationByHeader('Пол получателя'),
    });
  },

  qualification: (cell, row) => {
    const qualification = String(cell.value) || '';

    for (const key in levelObj) {
      if (qualification.toLowerCase().includes(key)) {
        const textCell = row.getCell(RESULT_COLS.qualificationText);
        const codeCell = row.getCell(RESULT_COLS.qualificationCode);

        fillCell(textCell, {
          value: levelObj[key],
          style: requiredCell,
          dataValidation: getValidationByHeader('Наименование уровня образования'),
        });
        fillCell(codeCell, {
          value: levelCodeObj[key],
          style: requiredCell,
          dataValidation: getValidationByHeader('Код уровня образования'),
        });

        break;
      }
    }
  },

  enrollOrderDate: (cell, row, ctx) => {
    if (cell.value) {
      const match = String(cell.value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

      ctx.studyBegin = match ? Number(match[3]) : null;
    }

    fillCell(row.getCell(RESULT_COLS.enrollOrderDate1), {
      value: cell.value,
      style: requiredCell,
    });
    fillCell(row.getCell(RESULT_COLS.enrollOrderDate2), {
      value: cell.value,
      style: requiredCell,
    });
    fillCell(row.getCell(RESULT_COLS.studyBegin), {
      value: ctx.studyBegin ? `01.09.${ctx.studyBegin}` : '',
      style: requiredCell,
    });
  },

  studyPeriod: (cell, row, ctx) => {
    const studyPeriod = getStudyPeriod(cell.value);
    if (ctx.studyBegin) {
      const studyBeginDate = new Date(Date.UTC(ctx.studyBegin, 8, 1));
      studyBeginDate.setUTCHours(3, 0, 0, 0);

      const studyEndDate = new Date(studyBeginDate);
      const day = studyEndDate.getDate();

      studyEndDate.setMonth(studyEndDate.getMonth() + studyPeriod);

      if (studyEndDate.getDate() !== day) {
        studyEndDate.setDate(0);
      }

      ctx.studyEnd = studyEndDate.getFullYear();
    }

    fillCell(row.getCell(RESULT_COLS.studyPeriod), {
      value: studyPeriod,
      style: requiredCell,
    });
    fillCell(row.getCell(RESULT_COLS.studyPeriod2), {
      value: studyPeriod,
      style: requiredCell,
    });
    fillCell(row.getCell(RESULT_COLS.studyEnd), {
      value: ctx.studyEnd ? `30.06.${ctx.studyEnd}` : '',
      style: requiredCell,
    });
  },

  eduSpecialty: (cell, row, ctx) => {
    const match = String(cell.value ?? '').match(/^([\d.]+)\s+(.+)$/);

    if (!match) return;

    const [, code, name] = match;

    ctx.specialty = name;

    fillCell(row.getCell(RESULT_COLS.eduName), { value: name, style: requiredCell });
    fillCell(row.getCell(RESULT_COLS.eduCode), { value: code, style: requiredCell });
  },

  eduProfile: (cell, row, ctx) => {
    const eduProfile = String(cell.value ?? '').trim();
    const eduCell = row.getCell(RESULT_COLS.eduProgram);

    fillCell(eduCell, { value: eduProfile || ctx.specialty, style: requiredCell });
  },

  documentType: (cell, row, ctx) => {
    const russiaCell = row.getCell(RESULT_COLS.documentRussia);
    const otherCell = row.getCell(RESULT_COLS.documentOther);

    russiaCell.style = defaultCell;
    otherCell.style = defaultCell;

    if (cell.value === 'Паспорт РФ') {
      ctx.isRussian = true;

      russiaCell.value = 'Паспорт гражданина Российской Федерации';
      russiaCell.dataValidation = getValidationByHeader('Тип документа РФ');
    } else {
      otherCell.value = cell.value;
    }
  },

  series: (cell, row, ctx) => {
    ctx.snils.series = cell.value;

    const russiaCell = row.getCell(RESULT_COLS.russiaSeries);
    const otherCell = row.getCell(RESULT_COLS.otherSeries);

    russiaCell.style = defaultCell;
    otherCell.style = defaultCell;

    if (ctx.isRussian) russiaCell.value = cell.value;
    else otherCell.value = cell.value;
  },

  number: (cell, row, ctx) => {
    ctx.snils.number = cell.value;

    const russiaCell = row.getCell(RESULT_COLS.russiaNumber);
    const otherCell = row.getCell(RESULT_COLS.otherNumber);

    russiaCell.style = defaultCell;
    otherCell.style = defaultCell;

    if (ctx.isRussian) russiaCell.value = cell.value;
    else otherCell.value = cell.value;
  },

  issuedDate: (cell, row, ctx) => {
    const russiaCell = row.getCell(RESULT_COLS.russiaIssuedDate);
    const otherCell = row.getCell(RESULT_COLS.otherIssuedDate);

    russiaCell.style = defaultCell;
    otherCell.style = defaultCell;

    if (ctx.isRussian) russiaCell.value = cell.value;
    else otherCell.value = cell.value;
  },

  financing: (cell, row) => {
    const value = cell.value;
    const financingCell = row.getCell(RESULT_COLS.financing);

    const financingValue = value ? 'Федеральный бюджет' : 'За счет средств физических лиц';

    console.log(value, financingValue);

    fillCell(financingCell, {
      value: financingValue,
      style: requiredCell,
      dataValidation: getValidationByHeader('Источник финансирования обучения'),
    });
  },

  learningType: (cell, row) => {
    const value = cell.value;
    const learningCell = row.getCell(RESULT_COLS.typePlaces);

    const learningValue =
      value.toLowerCase() === 'бюджет' ? 'Основные места в рамках КЦП' : 'Платные места';

    fillCell(learningCell, {
      value: learningValue,
      style: requiredCell,
      dataValidation: getValidationByHeader('Вид мест'),
    });
  },

  course: (cell, row) => {
    fillCell(row.getCell(RESULT_COLS.course), {
      value: Number(cell.value),
      style: requiredCell,
      dataValidation: getValidationByHeader('Номер курса'),
    });
  },

  studyForm: (cell, row) => {
    let value = cell.value;

    if (value === 'Очно-заочная') {
      value = 'Очно-заочная (вечерняя)';
    }

    fillCell(row.getCell(RESULT_COLS.studyForm), {
      value,
      style: requiredCell,
      dataValidation: getValidationByHeader('Форма обучения'),
    });
  },

  deductDate: (cell, row, ctx) => {},

  graduationDate: (cell, row, ctx) => {},
};

const makeSnilsKey = (fio, series, number) => `${fio}_${series}/${number}`;

const buildSnilsMap = (worksheet, headersRow, tandemKeys) => {
  const map = new Map();
  const headerRow = headersRow[worksheet.name];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRow) return;

    const fio = row.getCell(tandemKeys.fio.position).value;
    const series = row.getCell(tandemKeys.series.position).value;
    const number = row.getCell(tandemKeys.number.position).value;
    const snils = row.getCell(tandemKeys.snils.position).value;

    map.set(makeSnilsKey(fio, series, number), snils);
  });

  return map;
};

const getStudyPeriod = (period) => {
  const parsedPeriod = period.match(/\d+/g).map(Number);

  if (parsedPeriod.length === 1) return parsedPeriod[0] * 12;
  else return parsedPeriod[0] * 12 + parsedPeriod[1];
};

export const createStudentExcel = async (file, fileName) => {
  const dataTable = new ExcelTable('dataTable');
  const resultTable = new ExcelTable(fileName);

  const resultSheet = resultTable.createSheet('Обучающиеся');

  fillReportHeaders(resultSheet, headers);

  await dataTable.workBook.xlsx.load(file.buffer);

  const personWorksheet = dataTable.workBook.getWorksheet('Персоны');
  const studentWorksheet = dataTable.workBook.getWorksheet('Обучающиеся');

  let total = 0;

  const {
    keysObject: tandemKeys,
    headersRow,
    errors,
    warns,
  } = await checkKeysPositions(tandemDataKeys, [personWorksheet, studentWorksheet]);

  if (errors.length) {
    throw new Error(`Ошибка! Обязательные столбцы не были найдены в выгрузке Tandem.\n
                    Обязательные поля: ${JSON.stringify(errors)}\n
                    Не обязательные поля: ${JSON.stringify(warns)}`);
  }

  const snilsMap = buildSnilsMap(personWorksheet, headersRow, tandemKeys);

  studentWorksheet.eachRow((row, rowNumber) => {
    if (rowNumber > headersRow[studentWorksheet.name]) {
      const resultRow = resultSheet.getRow(rowNumber - headersRow[studentWorksheet.name] + 1);

      const ctx = {
        snils: { fio: '', series: '', number: '' },
        isRussian: false,
        age: undefined,
        gender: undefined,
        studyBegin: '',
        studyEnd: '',
        specialty: '',
      };

      for (const key in tandemKeys) {
        const cell = row.getCell(tandemKeys[key].position);

        if (key === 'snils') continue;

        if (handlers[key]) {
          handlers[key](cell, resultRow, ctx);
        } else {
          const resultCell = resultRow.getCell(reportDataKeys[key]);
          const isRequired = tandemKeys[key].required;

          if (isRequired && !cell.value)
            fillCell(resultCell, {
              value: cell.value,
              style: dangerCell,
            });
          else
            fillCell(resultCell, {
              value: cell.value,
              style: isRequired ? requiredCell : defaultCell,
            });
        }
      }

      // Заполняем СНИЛС отдельно по мапу листа "Персоны"
      fillCell(resultRow.getCell(RESULT_COLS.snils), {
        value: snilsMap.get(makeSnilsKey(ctx.snils.fio, ctx.snils.series, ctx.snils.number)) || '',
        style: defaultCell,
      });
      // Отправляем в ГИР ВУ всех мужчин старше 17 лет
      fillCell(resultRow.getCell(RESULT_COLS.sendToGir), {
        value: ctx.age > 17 && ctx.gender === 'Муж' ? 'Да' : '',
        style: defaultCell,
        dataValidation: getValidationByHeader('Отправить в ГИР ВУ '),
      });
      fillCell(resultRow.getCell(RESULT_COLS.studyYear), {
        value: 2026,
        style: requiredCell,
      });

      // Если header не был включен в список заполняемых значений - подставляем в ячейку стиль
      headers.forEach((header) => {
        const resultKeys = Object.values(RESULT_COLS);
        const dataKeys = Object.values(reportDataKeys);

        if (
          !resultKeys.find((el) => el === header.position) &&
          !dataKeys.find((el) => el === header.position)
        ) {
          fillCell(resultRow.getCell(header.position), { style: defaultCell });
        }
      });

      total++;
    }
  });

  await resultTable.saveTable('./data/student');

  return total;
};
