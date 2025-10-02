import knex from 'knex';

const { Knex } = knex;

import { jmuConnection } from '../../database/knexfile.js';
import { ExcelTable } from '../../utils/excel.fileGenerator.js';

/**
 * @type {import('exceljs').Style}
 */
const defaultCell = {
  alignment: {
    wrapText: true,
    vertical: 'middle',
    horizontal: 'center',
    indent: 1,
    readingOrder: 'ltr',
    shrinkToFit: false,
  },
  border: {
    top: {
      style: 'thin',
      color: { argb: '000000' },
    },
    bottom: {
      style: 'thin',
      color: { argb: '000000' },
    },
    left: {
      style: 'thin',
      color: { argb: '000000' },
    },
    right: {
      style: 'thin',
      color: { argb: '000000' },
    },
  },
};

/**
 * @type {import('exceljs').Style}
 */
const headerStyle = {
  ...defaultCell,
  font: {
    bold: true,
    color: { argb: 'FFFFFFFF' },
  },
  fill: {
    pattern: 'solid',
    type: 'pattern',
    fgColor: { argb: 'FE32C0E2' },
  },
};

/**
 * @type {import('exceljs').Style}
 */
const rowTitleStyle = {
  ...defaultCell,
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDEDED' } },
};

export const getStudentSummary = async (year, form) => {
  const formEnum = {
    1: 'ОФО',
    2: 'ЗФО',
    3: 'ОЗФО',
  };

  const data = {
    3: await getDataByLevel(form, 1, year),
    9: await getDataByLevel(form, 3, year),
    15: await getDataByLevel(form, 2, year),
  };

  const excel = new ExcelTable(`Отчет по студентам ${formEnum[form]}`);

  const sheetName = formEnum[form];

  const sheet = excel.createSheet(sheetName);

  sheet.getColumn(1).width = 25;

  fillHeaders(sheet, excel, sheetName);

  fillData(data, sheet);

  fillFooter(data, sheet);

  await excel.saveTable('./data');
};

const defaultQuery = (form, level) => {
  return jmuConnection('students_groups as sg')
    .select({
      age: jmuConnection.raw(`date_part('year', age(current_date, s.birthday))`),
      students: jmuConnection.count('s.id'),
      female: jmuConnection.sum(
        jmuConnection.raw(`case 
		        when s.gender = 'female' then 1
		        else 0
	        end`),
      ),
    })
    .innerJoin('study_groups as gr', 'sg.id_group', 'gr.id')
    .innerJoin('students as s', 'sg.id_student', 's.id')
    .andWhere('gr.id_form', form)
    .whereNotIn('gr.id_faculty', [1, 2, 109])
    .andWhere('gr.id_level', level)
    .groupBy('gr.id_level', 'age')
    .orderBy('gr.id_level', 'age');
};

/**
 *
 * @param {Knex} query
 */
const getAcceptedAmount = (query, year) => {
  return Object.create(query).where('gr.date_start', year).andWhere('gr.closed', false);
};

/**
 *
 * @param {Knex} query
 */
const getCurrentAmount = (query) => {
  return query.where('sg.status', 0).where('gr.closed', false);
};

/**
 *
 * @param {Knex} query
 */
const getGraduatedAmount = (query, year) => {
  return query.where('sg.status', 1).andWhere('gr.date_end', year);
};

/**
 *
 * @param {import('exceljs').Worksheet} sheet
 * @param {ExcelTable} excel
 * @param {string} sheetName
 */
const fillHeaders = (sheet, excel, sheetName) => {
  const dataArr = [
    { idLevel: 1, label: 'Программы бакалавриата' },
    { idLevel: 3, label: 'Программы специалитета' },
    { idLevel: 2, label: 'Программы магистратуры' },
  ];

  let initialCol = 3;

  for (let i = 0; i < dataArr.length; i++) {
    const obj = dataArr[i];

    const headers = [
      'Принято',
      'из них женщины',
      'Численность студентов',
      'из них женщины',
      'Выпуск',
      'из них женщины',
    ];

    sheet.mergeCells(1, initialCol, 1, initialCol + 5);
    sheet.getCell(1, initialCol).value = obj.label;
    sheet.getCell(1, initialCol).style = headerStyle;

    excel.fillSimpleHeaders(headers, sheetName, headerStyle, 2, initialCol);

    initialCol = initialCol + 6;
  }

  sheet.mergeCells(1, 1, 2, 1);
  sheet.getCell(1, 1).value = 'Наименование показателей';
  sheet.getCell(1, 1).style = headerStyle;

  sheet.mergeCells(1, 2, 2, 2);
  sheet.getCell(1, 2).value = '№ строки';
  sheet.getCell(1, 2).style = headerStyle;

  excel.fillSimpleHeaders(
    Array.from({ length: 20 }, (_, i) => i + 1),
    sheetName,
    headerStyle,
    3,
  );
};

/**
 *
 * @param {*} data
 * @param {import('exceljs').Worksheet} sheet
 */
const fillData = (data, sheet) => {
  /**
   * @type {{[key: string]: undefined | number | { from?: number, to?: number }}}
   */
  const dataObjKeys = {
    Всего: undefined,
    'В возрасте (число полных лет на 1 января следующего года): моложе 15 лет': { to: 14 },
    '15 лет': 15,
    '16 лет': 16,
    '17 лет': 17,
    '18 лет': 18,
    '19 лет': 19,
    '20 лет': 20,
    '21 лет': 21,
    '22 лет': 22,
    '23 лет': 23,
    '24 лет': 24,
    '25 лет': 25,
    '26 лет': 26,
    '27 лет': 27,
    '28 лет': 28,
    '29 лет': 29,
    '30–34 года': { from: 29, to: 35 },
    '35–39 лет': { from: 34, to: 40 },
    '40 лет и старше': { from: 39 },
  };

  let row = 4;

  for (const key in dataObjKeys) {
    sheet.getCell(row, 1).value = key;
    sheet.getCell(row, 1).style = {
      ...rowTitleStyle,
      alignment: {
        ...rowTitleStyle.alignment,
        horizontal: 'left',
      },
    };
    sheet.getCell(row, 2).value = row - 3;
    sheet.getCell(row, 2).style = rowTitleStyle;

    for (const col in data) {
      let column = Number(col);
      const value = dataObjKeys[key];

      const filteredAccepted = getTotal(
        data[col].accepted.filter((el) => filterObjValues(value, el)),
      );
      const filteredCurrent = getTotal(
        data[col].current.filter((el) => filterObjValues(value, el)),
      );
      const filteredGraduated = getTotal(
        data[col].graduated.filter((el) => filterObjValues(value, el)),
      );

      sheet.getCell(row, column).value = filteredAccepted.all;
      sheet.getCell(row, column + 1).value = filteredAccepted.female;
      sheet.getCell(row, column + 2).value = filteredCurrent.all;
      sheet.getCell(row, column + 3).value = filteredCurrent.female;
      sheet.getCell(row, column + 4).value = filteredGraduated.all;
      sheet.getCell(row, column + 5).value = filteredGraduated.female;

      sheet.getCell(row, column).style = defaultCell;
      sheet.getCell(row, column + 1).style = defaultCell;
      sheet.getCell(row, column + 2).style = defaultCell;
      sheet.getCell(row, column + 3).style = defaultCell;
      sheet.getCell(row, column + 4).style = defaultCell;
      sheet.getCell(row, column + 5).style = defaultCell;
    }

    row++;
  }
};

/**
 *
 * @param {*} data
 * @param {import('exceljs').Worksheet} sheet
 */
const fillFooter = (data, sheet) => {
  let total = 0;

  for (const key in data) {
    for (const valKey in data[key]) {
      if (valKey.includes('Total')) total += data[key][valKey].all;
    }
  }

  sheet.mergeCells(24, 1, 24, 20);
  sheet.getCell(24, 1).value = `Код по ОКЕИ: человек – ${total}`;
  sheet.getCell(24, 1).style = {
    ...headerStyle,
    alignment: {
      ...headerStyle.alignment,
      horizontal: 'left',
    },
  };
};

const getDataByLevel = async (form, idLevel, year) => {
  const accepted = await getAcceptedAmount(defaultQuery(form, idLevel), year);
  const current = await getCurrentAmount(defaultQuery(form, idLevel));
  const graduated = await getGraduatedAmount(
    defaultQuery(form, idLevel),
    idLevel === 3 ? Number(year) - 1 : year,
  );

  return {
    accepted,
    acceptedTotal: getTotal(accepted),
    current,
    currentTotal: getTotal(current),
    graduated,
    graduatedTotal: getTotal(graduated),
  };
};

const getTotal = (data) => {
  return data.reduce(
    (prev, curr) => ({
      all: prev.all + Number(curr.students),
      female: prev.female + Number(curr.female),
    }),
    { all: 0, female: 0 },
  );
};

const filterObjValues = (value, el) => {
  let expression;

  switch (typeof value) {
    case 'undefined':
    case 'object':
      if (value?.from) expression = `${el.age} > ${value.from}`;
      if (value?.to)
        expression = expression
          ? expression + ` && ${el.age} < ${value.to}`
          : `${el.age} < ${value.to}`;
      break;
    case 'number':
      expression = `${el.age} === ${value}`;
      break;
    default:
      break;
  }

  return expression ? eval(expression) : true;
};
