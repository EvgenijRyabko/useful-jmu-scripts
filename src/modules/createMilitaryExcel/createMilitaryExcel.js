import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
import { ExcelTable } from '../../utils/excel.fileGenerator.js';
import { dangerCell, defaultCell, headerStyle, warningCell } from '../../utils/excel.styles.js';
import data from './data.json' with { type: 'json' };
import headers from './headers.json' with { type: 'json' };

const connection = jmuConnection;

const facultyEnum = Object.freeze({
  95: 'ИЕН',
  12: 'ИММОСПН',
  102: 'ИМХО',
  21: 'ИПП',
  27: 'ИПР',
  33: 'ИФМОИОТ',
  44: 'ИФВС',
  111: 'ИФИСК',
  54: 'Научный отдел',
  109: 'Старобельский факультет',
});

const levelObj = Object.freeze({
  1: 'Высшее - бакалавриат',
  2: 'Высшее - магистратура',
  3: 'Высшее - специалитет',
  6: 'Высшее - подготовка кадров высокой квалификации',
});

const levelCodeObj = Object.freeze({
  1: '09',
  2: '11',
  3: '10',
  6: '12',
});

const getStudyPeriod = (period) => {
  const parsedPeriod = period.match(/\d+/g).map(Number);

  if (parsedPeriod.length === 1) return parsedPeriod[0] * 12;
  else return parsedPeriod[0] * 12 + parsedPeriod[1];
};

const findStudent = (data) => {
  return connection('students as s')
    .select(
      's.id as student_id',
      's.lastname',
      's.firstname',
      's.middlename',
      's.gender',
      's.snils',
      'sg.record_book',
      'spec.minid',
      'gr.course',
      'sp.study_period',
      'gr.id_faculty',
      {
        birthday: connection.raw(`TO_CHAR(s.birthday, 'dd.mm.yyyy')`),
        level: 'gr.id_level',
        specialty: 'spec.name',
        profile: 'sp.name',
        date_start: connection.raw(`CONCAT('01.09.', gr.date_start)`),
        date_end: connection.raw(`CONCAT('30.06.', gr.date_end)`),
        idStudentGroup: 'sg.id',
        gender: connection.raw(`case when s.gender = 'male' then 'Муж' else 'Жен' end`),
      },
    )
    .innerJoin('students_groups as sg', 'sg.id_student', 's.id')
    .innerJoin('study_groups as gr', 'gr.id', 'sg.id_group')
    .innerJoin('specialty_profile as sp', 'sp.id', 'gr.id_profile')
    .innerJoin('specialties as spec', 'spec.id', 'sp.id_specialty')
    .where((builder) => {
      for (const key in data) builder.andWhere(connection.raw(`trim(${key})`), data[key].trim());
    })
    .whereIn('sg.status', [0, 5])
    .andWhere('gr.closed', false)
    .andWhere('gr.id_form', 1)
    .andWhere(connection.raw(`date_part('year',age(s.birthday::date)) < 51`))
    .first();
};

const findStudentOrder = async (idStudent, idStudentGroup) => {
  const inCurrentGroup = await connection('students_groups_orders as sgo')
    .select('o.name as order_name', 'o.date as order_date', 'o.id_type_order')
    .innerJoin('orders as o', 'sgo.id_order', 'o.id')
    .where('sgo.id_students_groups', idStudentGroup)
    .whereIn('o.id_type_order', [1, 12])
    .orderBy(connection.raw(`to_date(o.date, 'DD.MM.YYYY')`), 'desc')
    .first();

  if (inCurrentGroup) return inCurrentGroup;

  const groupInfo = await connection('students_groups as sg')
    .select('gr.id_level')
    .innerJoin('study_groups as gr', 'gr.id', 'sg.id_group')
    .where('sg.id', idStudentGroup)
    .first();

  const inOtherGroups = await connection('students_groups_orders as sgo')
    .select('o.name as order_name', 'o.date as order_date', 'o.id_type_order')
    .innerJoin('students_groups as sg', 'sg.id', 'sgo.id_students_groups')
    .innerJoin('study_groups as gr', 'gr.id', 'sg.id_group')
    .innerJoin('orders as o', 'sgo.id_order', 'o.id')
    .where('sg.id_student', idStudent)
    .whereIn('o.id_type_order', [1, 12])
    .andWhere('gr.id_level', groupInfo.id_level)
    .orderBy(connection.raw(`to_date(o.date, 'DD.MM.YYYY')`), 'desc')
    .first();

  if (inOtherGroups) return inOtherGroups;

  return connection('students_groups_orders as sgo')
    .select('o.name as order_name', 'o.date as order_date', 'o.id_type_order')
    .innerJoin('students_groups as sg', 'sg.id', 'sgo.id_students_groups')
    .innerJoin('study_groups as gr', 'gr.id', 'sg.id_group')
    .innerJoin('orders as o', 'sgo.id_order', 'o.id')
    .where('sg.id_student', idStudent)
    .whereIn('o.id_type_order', [1, 2, 3, 7, 12, 16])
    .andWhere('gr.id_form', 1)
    .andWhere('gr.id_level', groupInfo.id_level)
    .orderBy(connection.raw(`to_date(o.date, 'DD.MM.YYYY')`), 'desc')
    .first();
};

const getStudentDocument = async (idStudent, passport) => {
  const [series, number] = passport.trim().split(/, | /);

  const finded = await connection('students_documents as sd')
    .select('sd.series', 'sd.number', {
      issued_date: connection.raw(`TO_CHAR(sd.issued_date, 'dd.mm.yyyy')`),
    })
    .where('id_student', idStudent)
    .andWhere({ series: series?.trim(), number: number?.trim() })
    .orderBy('id_type_document')
    .first();

  if (finded) return finded;
  return connection('students_documents as sd')
    .select('sd.series', 'sd.number', {
      issued_date: connection.raw(`TO_CHAR(sd.issued_date, 'dd.mm.yyyy')`),
    })
    .where('id_student', idStudent)
    .orderBy('id_type_document')
    .first();
};

export const createMilitaryExcel = async () => {
  try {
    const parsedData = await parseStudentsData(data);

    for (const key in facultyEnum) {
      const excel = new ExcelTable(`Военнообязанные ${facultyEnum[key]}`);

      const onlyInThisFaculty = parsedData.filter((el) => el.id_faculty == key);

      const sheets = {
        1: '1 Курс',
        2: '2 Курс',
        3: '3 Курс',
        4: '4 Курс',
        5: '5 Курс',
      };

      for (const sheetKey in sheets) {
        const currentCourse = onlyInThisFaculty.filter((el) => el.course == sheetKey);

        if (!currentCourse.length) continue;

        excel.createSheet(sheets[sheetKey]);
        excel.fillSimpleHeaders(headers, sheets[sheetKey], headerStyle);

        currentCourse.forEach((student, index) => {
          const [series, number] = student.old.passport.trim().split(/, | /);

          const anotherPassport = series != student.series || number != student.number;
          const notEnrollOrder = ![1, 12].includes(student.id_type_order);

          fillData(student, index + 2, excel.sheets[sheets[student.course]], {
            anotherPassport,
            notEnrollOrder,
          });
        });
      }

      excel.saveTable('./data/military');

      console.log(`Done ${facultyEnum[key]}`);
    }
  } catch (err) {
    console.error(err?.message || err);
  }
};

const parseStudentsData = async (data) => {
  const parsedData = [];

  for (const student of data) {
    const fio = `${student.lastname} ${student.firstname} ${student.middlename}`;

    const finded = await findStudent({
      lastname: student.lastname,
      firstname: student.firstname,
      middlename: student.middlename,
    });

    if (!finded) {
      console.log(`Not finded ${fio}`);
      continue;
    }

    const order = await findStudentOrder(finded.student_id, finded.idStudentGroup);

    if (!order) throw `No order ${fio} ${finded.idStudentGroup}`;

    const document = await getStudentDocument(finded.student_id, student.passport);

    if (!document) throw `No document ${fio} ${finded.student_id}`;

    parsedData.push({ ...finded, ...order, ...document, old: student });
  }

  return parsedData;
};

/**
 *
 * @param {*} data
 * @param {number} rowIndex
 * @param {import('exceljs').Worksheet} sheet
 * @param {{ anotherPassport: boolean, notEnrollOrder: boolean }} options
 */
const fillData = (student, rowIndex, sheet, options) => {
  sheet.getCell(rowIndex, 1).value = student.lastname.trim();
  sheet.getCell(rowIndex, 2).value = student.firstname.trim();
  sheet.getCell(rowIndex, 3).value = student.middlename.trim();
  sheet.getCell(rowIndex, 4).value = student.gender;
  sheet.getCell(rowIndex, 5).value = student.birthday;
  sheet.getCell(rowIndex, 6).value = student.series;
  sheet.getCell(rowIndex, 7).value = student.number;
  sheet.getCell(rowIndex, 8).value = student.issued_date;
  sheet.getCell(rowIndex, 9).value = student.snils;
  sheet.getCell(rowIndex, 10).value = levelObj[student.level];
  sheet.getCell(rowIndex, 11).value = levelCodeObj[student.level];
  sheet.getCell(rowIndex, 12).value = student.record_book;
  sheet.getCell(rowIndex, 13).value = student.date_start;
  sheet.getCell(rowIndex, 14).value = student.course;
  sheet.getCell(rowIndex, 15).value = student.specialty;
  sheet.getCell(rowIndex, 16).value = student.minid;
  sheet.getCell(rowIndex, 17).value = 'Очная';
  sheet.getCell(rowIndex, 18).value = student.order_date;
  sheet.getCell(rowIndex, 19).value = student.order_date;
  sheet.getCell(rowIndex, 20).value = student.order_name;
  sheet.getCell(rowIndex, 24).value =
    `${student.specialty}${student.profile?.trim() === '-' ? '' : `. ${student.profile}`}`;
  sheet.getCell(rowIndex, 25).value = student.date_start;
  sheet.getCell(rowIndex, 26).value = getStudyPeriod(student.study_period);
  sheet.getCell(rowIndex, 27).value = student.date_end;

  Array.from({ length: headers.length }, (_, i) => i + 1).forEach((col) => {
    sheet.getCell(rowIndex, col).style = defaultCell;
  });

  if (options?.anotherPassport) {
    sheet.getCell(rowIndex, 6).style = warningCell;
    sheet.getCell(rowIndex, 7).style = warningCell;
    sheet.getCell(rowIndex, 8).style = warningCell;
  }

  if (options?.notEnrollOrder) {
    sheet.getCell(rowIndex, 18).style = dangerCell;
    sheet.getCell(rowIndex, 19).style = dangerCell;
    sheet.getCell(rowIndex, 20).style = dangerCell;
  }
};
