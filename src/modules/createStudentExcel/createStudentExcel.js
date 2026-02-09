import { ExcelTable } from '../../utils/excel.fileGenerator.js';
import { headerStyle } from '../../utils/excel.styles.js';
import headers from './headers.json' with { type: 'json' };

const tandemDataKeys = {
  fio: 2,
  gender: 3,
  birthday: 4,
  series: 6,
  number: 7,
  issuedDate: 8,
  recordBook: 18,
  course: 20,
  educationProgram: 25,
  eduProfile: 26,
  qualification: 28,
  studyForm: 31,
  enrollOrderDate: 47,
  studyPeriod: 34,
  enrollOrder: 46,
  enrollDate: 45,
};

const reportDataKeys = {
  gender: 4,
  birthday: 5,
  issuedDate: 8,
  recordBook: 12,
  course: 14,
  studyForm: 17,
  enrollDate: 18,
  enrollOrder: 20,
  eduProfile: 24,
  studyPeriod: 26,
};

const RESULT_COLS = {
  lastname: 1,
  firstname: 2,
  middlename: 3,
  series: 6,
  number: 7,
  snils: 9,
  qualificationText: 10,
  qualificationCode: 11,
  enrollOrderDate1: 13,
  eduName: 15,
  eduCode: 16,
  enrollOrderDate2: 19,
  studyPeriod: 26,
  studyBegin: 25,
  studyEnd: 27,
};

const levelObj = Object.freeze({
  Бакалавр: 'Высшее - бакалавриат',
  Магистр: 'Высшее - магистратура',
  3: 'Высшее - специалитет',
  'Без квалификации': 'Высшее - подготовка кадров высокой квалификации',
});

const levelCodeObj = Object.freeze({
  Бакалавр: '09',
  Магистр: '11',
  3: '10',
  'Без квалификации': '12',
});

const handlers = {
  fio: (cell, row, ctx) => {
    ctx.snils.fio = cell.value;

    const [ln = '', fn = '', mn = ''] = String(cell.value ?? '')
      .trim()
      .split(/\s+/);

    row.getCell(RESULT_COLS.lastname).value = ln;
    row.getCell(RESULT_COLS.firstname).value = fn;
    row.getCell(RESULT_COLS.middlename).value = mn;
  },

  gender: (cell, row) => {
    row.getCell(reportDataKeys.gender).value = cell.value === 'М' ? 'Муж' : 'Жен';
  },

  qualification: (cell, row) => {
    row.getCell(RESULT_COLS.qualificationText).value = levelObj[cell.value];
    row.getCell(RESULT_COLS.qualificationCode).value = levelCodeObj[cell.value];
  },

  enrollOrderDate: (cell, row, ctx) => {
    if (cell.value) {
      const match = String(cell.value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

      ctx.studyBegin = match ? Number(match[3]) : null;
    }

    row.getCell(RESULT_COLS.enrollOrderDate1).value = cell.value;
    row.getCell(RESULT_COLS.enrollOrderDate2).value = cell.value;
    row.getCell(RESULT_COLS.studyBegin).value = ctx.studyBegin ? `01.09.${ctx.studyBegin}` : '';
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

    row.getCell(RESULT_COLS.studyPeriod).value = studyPeriod;
    row.getCell(RESULT_COLS.studyEnd).value = ctx.studyEnd ? `30.06.${ctx.studyEnd}` : '';
  },

  educationProgram: (cell, row) => {
    const match = String(cell.value ?? '').match(/^([\d.]+)\s+(.+)$/);

    if (!match) return;

    const [, code, name] = match;

    row.getCell(RESULT_COLS.eduName).value = name;
    row.getCell(RESULT_COLS.eduCode).value = code;
  },

  series: (cell, row, ctx) => {
    ctx.snils.series = cell.value;
    row.getCell(RESULT_COLS.series).value = cell.value;
  },

  number: (cell, row, ctx) => {
    ctx.snils.number = cell.value;
    row.getCell(RESULT_COLS.number).value = cell.value;
  },
};

const makeSnilsKey = (fio, series, number) => `${fio}_${series}/${number}`;

const buildSnilsMap = (worksheet) => {
  const map = new Map();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return;

    const fio = row.getCell(2).value;
    const series = row.getCell(6).value;
    const number = row.getCell(7).value;
    const snils = row.getCell(14).value;

    map.set(makeSnilsKey(fio, series, number), snils);
  });

  return map;
};

const getStudyPeriod = (period) => {
  const parsedPeriod = period.match(/\d+/g).map(Number);

  if (parsedPeriod.length === 1) return parsedPeriod[0] * 12;
  else return parsedPeriod[0] * 12 + parsedPeriod[1];
};

export const createStudentExcel = async (file) => {
  const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

  const dataTable = new ExcelTable('dataTable');
  const resultTable = new ExcelTable(fileName.split('.')[0] || 'data');

  const resultSheet = resultTable.createSheet('Обучающиеся');

  resultTable.fillSimpleHeaders(headers, 'Обучающиеся', headerStyle);

  await dataTable.workBook.xlsx.load(file.buffer);

  const personWorksheet = dataTable.workBook.getWorksheet('Персоны');
  const studentWorksheet = dataTable.workBook.getWorksheet('Обучающиеся');

  const snilsMap = buildSnilsMap(personWorksheet);

  studentWorksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 6) {
      const resultRow = resultSheet.getRow(rowNumber - 5);

      const ctx = {
        snils: { fio: '', series: '', number: '' },
        studyBegin: '',
        studyEnd: '',
      };

      for (const key in tandemDataKeys) {
        const cell = row.getCell(tandemDataKeys[key]);

        if (handlers[key]) {
          handlers[key](cell, resultRow, ctx);
        } else {
          resultRow.getCell(reportDataKeys[key]).value = cell.value;
        }
      }

      resultRow.getCell(RESULT_COLS.snils).value =
        snilsMap.get(makeSnilsKey(ctx.snils.fio, ctx.snils.series, ctx.snils.number)) || '';
    }
  });

  await resultTable.saveTable('./data/student');
};
