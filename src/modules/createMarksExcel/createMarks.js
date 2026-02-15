import { jmuConnection } from '../../database/knexfile.js';
import { ExcelTable } from '../../utils/excel.fileGenerator.js';
import { defaultCell, headerStyle } from '../../utils/excel.styles.js';
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

// const baseSubjectControlsQuery = () => {
//   return connection('plan_subjects_group as psg')
//     .select(
//       connection.raw(`jsonb_agg(
//             jsonb_build_object(
//                 'ministryCode', psg."ministryCode",
//                 'subjectName', ps.name,
//                 'course', psc.course,
//                 'semester', psc.semester,
//                 'hoursInCredit', psc.hours_in_credit,
//                 'dateExam', psc.date_exam,
//                 'formControl', pfc.name,
//                 'teacher', (case
//                   when person.id is not null
//                     then concat(person.firstname, ' ', left(person.name, 1), '.', left(person.lastname, 1), '.')
//                   else null
//                   end),
//                 'mark', sm.ball_5)
//             order by psc.course::int, psc.semester::int)`),
//     )
//     .innerJoin('plan_subjects as ps', 'psg.id_subject', 'ps.id')
//     .innerJoin('plan_subjects_control as psc', 'psg.id', 'psc.id_subject_group')
//     .innerJoin('plan_form_control as pfc', 'pfc.id', 'psc.id_form_control')
//     .leftOuterJoin('Persons as person', 'person.id', 'psc.idWorker')
//     .innerJoin('students_marks as sm', function () {
//       this.on('psc.id', 'sm.id_subject_control').andOn('sm.id_students_groups', 'sg.id');
//     })
//     .where('psg.countInPlan', true)
//     .whereNotNull('sm.ball_100')
//     .whereRaw(`ps.name !~* '.*Научно.*исследовательская.*работа'`)
//     .whereRaw(`ps.name !~* '.*Выпускная.*квалификационная.*работа'`);
// };

const getStudentResearchWorkInfo = () => {
  return connection('plan_subjects_group as psg')
    .select(
      connection.raw(`jsonb_build_object(
                'subjectName', ps.name,
                'dateExam', psc.date_exam,
                'teacher', (case 
                  when person.id is not null
                    then concat(person.firstname, ' ', left(person.name, 1), '.', left(person.lastname, 1), '.')
                  else null
                  end),
                'mark', sm.ball_100)`),
    )
    .innerJoin('plan_subjects as ps', 'psg.id_subject', 'ps.id')
    .innerJoin('plan_subjects_control as psc', 'psg.id', 'psc.id_subject_group')
    .innerJoin('plan_form_control as pfc', 'pfc.id', 'psc.id_form_control')
    .leftOuterJoin('Persons as person', 'person.id', 'psc.idWorker')
    .innerJoin('students_marks as sm', function () {
      this.on('psc.id', 'sm.id_subject_control').andOn('sm.id_students_groups', 'sg.id');
    })
    .where('psg.countInPlan', true)
    .whereNotNull('sm.ball_100')
    .whereRaw(`ps.name ~* '.*Научно.*исследовательская.*работа'`)
    .first();
};

const getStudentGraduationWorkInfo = () => {
  return connection('plan_subjects_group as psg')
    .select(
      connection.raw(`jsonb_build_object(
                'dateExam', psc.date_exam,
                'mark', sm.ball_5)`),
    )
    .innerJoin('plan_subjects as ps', 'psg.id_subject', 'ps.id')
    .innerJoin('plan_subjects_control as psc', 'psg.id', 'psc.id_subject_group')
    .innerJoin('students_marks as sm', function () {
      this.on('psc.id', 'sm.id_subject_control').andOn('sm.id_students_groups', 'sg.id');
    })
    .where('psg.countInPlan', true)
    .whereNotNull('sm.ball_5')
    .whereRaw(`ps.name ~* '.*Выпускная.*квалификационная.*работа'`)
    .first();
};

const getFacultyCourses = (idFaculty) => {
  return connection('study_groups as gr')
    .distinct('course')
    .innerJoin('students_groups as sg', 'sg.id_group', 'gr.id')
    .whereIn('sg.status', [0, 5])
    .andWhere('gr.closed', false)
    .andWhere('gr.id_faculty', idFaculty)
    .orderBy('course');
};

const getAllStudents = (idFaculty, course) => {
  return connection('students_groups as sg')
    .select('s.id', 's.lastname', 's.firstname', 's.middlename', 'gr.course', 'gr.date_start', {
      studentGroupId: 'sg.id',
      recordBook: 'sg.record_book',
      researchWork: getStudentResearchWorkInfo(),
      graduationWork: getStudentGraduationWorkInfo(),
      optionalSubjects: connection.raw(`sc."optionalSubjects"`),
      internSubjects: connection.raw(`sc."internSubjects"`),
      practices: connection.raw(`sc."practices"`),
      courseWorks: connection.raw(`sc."courseWorks"`),
      lastOrder: connection.raw(`
        (select jsonb_build_object('name', o.name, 'date', o.date, 'idType', o.id_type_order)
        from education.students_groups_orders sgo
        inner join education.orders o on o.id = sgo.id_order
        where sgo.id_students_groups = sg.id
        and o.id_type_order in (1, 8, 9, 12, 7, 16)
        order by TO_DATE(o.date, 'dd.mm.yyyy') DESC
        limit 1)`),
    })
    .innerJoin('students as s', 's.id', 'sg.id_student')
    .innerJoin('study_groups as gr', 'gr.id', 'sg.id_group')
    .joinRaw(
      `LEFT JOIN LATERAL (
      SELECT jsonb_build_object('name', o.name, 'date', o.date, 'type', o.id_type_order) AS order_obj
      FROM education.students_groups_orders sgo
      JOIN education.orders o ON o.id = sgo.id_order
      WHERE sgo.id_students_groups = sg.id
        AND to_date(o.date, 'dd.mm.yyyy') > to_date(?, 'dd.mm.yyyy')
      ORDER BY to_date(o.date, 'dd.mm.yyyy') DESC
      LIMIT 1
    ) lo ON TRUE`,
      ['01.09.2025'],
    )
    .joinRaw(
      `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'ministryCode', psg."ministryCode",
            'subjectName', ps.name,
            'course', psc.course,
            'semester', psc.semester,
            'hoursInCredit', psc.hours_in_credit,
            'dateExam', psc.date_exam,
            'formControl', pfc.name,
            'teacher', CASE
              WHEN person.id IS NOT NULL
                THEN concat(person.firstname, ' ', left(person.name, 1), '.', left(person.lastname, 1), '.')
              ELSE NULL
            END,
            'mark', sm.ball_5
          )
          ORDER BY psc.course::int, psc.semester::int
        ) FILTER (WHERE psg."ministryCode" ~* '(ФТД|ФД).(\\\\d{2}).'),
        '[]'::jsonb
      ) AS "optionalSubjects",

      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'ministryCode', psg."ministryCode",
            'subjectName', ps.name,
            'course', psc.course,
            'semester', psc.semester,
            'hoursInCredit', psc.hours_in_credit,
            'dateExam', psc.date_exam,
            'formControl', pfc.name,
            'teacher', CASE
              WHEN person.id IS NOT NULL
                THEN concat(person.firstname, ' ', left(person.name, 1), '.', left(person.lastname, 1), '.')
              ELSE NULL
            END,
            'mark', sm.ball_5
          )
          ORDER BY psc.course::int, psc.semester::int
        ) FILTER (WHERE psg."ministryCode" !~* '(ФТД|ФД).(\\\\d{2}).' AND psc.id_subject_control_tag IS NULL),
        '[]'::jsonb
      ) AS "internSubjects",

      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'ministryCode', psg."ministryCode",
            'subjectName', ps.name,
            'course', psc.course,
            'semester', psc.semester,
            'hoursInCredit', psc.hours_in_credit,
            'dateExam', psc.date_exam,
            'formControl', pfc.name,
            'teacher', CASE
              WHEN person.id IS NOT NULL
                THEN concat(person.firstname, ' ', left(person.name, 1), '.', left(person.lastname, 1), '.')
              ELSE NULL
            END,
            'mark', sm.ball_5
          )
          ORDER BY psc.course::int, psc.semester::int
        ) FILTER (WHERE psc.id_subject_control_tag = 1),
        '[]'::jsonb
      ) AS "practices",

      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'ministryCode', psg."ministryCode",
            'subjectName', ps.name,
            'course', psc.course,
            'semester', psc.semester,
            'hoursInCredit', psc.hours_in_credit,
            'dateExam', psc.date_exam,
            'formControl', pfc.name,
            'teacher', CASE
              WHEN person.id IS NOT NULL
                THEN concat(person.firstname, ' ', left(person.name, 1), '.', left(person.lastname, 1), '.')
              ELSE NULL
            END,
            'mark', sm.ball_5
          )
          ORDER BY psc.course::int, psc.semester::int
        ) FILTER (WHERE psc.id_subject_control_tag = 2),
        '[]'::jsonb
      ) AS "courseWorks",

      (COUNT(*) > 0) AS has_any

    FROM plan_subjects_group as psg
    JOIN plan_subjects as ps ON psg.id_subject = ps.id
    JOIN plan_subjects_control as psc ON psg.id = psc.id_subject_group
    JOIN plan_form_control as pfc ON pfc.id = psc.id_form_control
    LEFT JOIN "Persons" as person ON person.id = psc."idWorker"
    JOIN students_marks as sm
      ON psc.id = sm.id_subject_control
     AND sm.id_students_groups = sg.id
    WHERE psg."countInPlan" = true
      AND sm.ball_100 IS NOT NULL
      AND ps.name !~* '.*Научно.*исследовательская.*работа'
      AND ps.name !~* '.*Выпускная.*квалификационная.*работа'
  ) sc ON TRUE
`,
    )
    .whereIn('sg.status', [0, 1, 2, 5])
    .andWhere(function () {
      this.whereIn('sg.status', [0, 5]).orWhereNotNull('lo.order_obj');
    })
    .andWhere('sc.has_any', true)
    .andWhere('gr.closed', false)
    .andWhere('gr.id_faculty', idFaculty)
    .andWhere('gr.course', course)
    .orderBy([
      { column: 'gr.id', order: 'asc' },
      { column: 's.lastname', order: 'asc' },
      { column: 's.firstname', order: 'asc' },
      { column: 's.middlename', order: 'asc' },
    ]);
};

export const createMarksExcel = async () => {
  let result;

  for (const key in facultyEnum) {
    const fileResults = await createFacultyExcel(key);

    result = {
      ...result,
      [`${facultyEnum[key]}.xlsx`]: fileResults,
    };
  }

  console.log(`✅ All files succesfully generated!`);
  console.table(result);
};

const createFacultyExcel = async (idFaculty) => {
  const result = {
    total: 0,
  };

  try {
    const xlsx = new ExcelTable(facultyEnum[idFaculty]);

    const courses = await getFacultyCourses(idFaculty);
    const pCourses = courses.map((el) => el.course);

    for (const course of pCourses) {
      const pHeaders = [...headers];

      const courseStr = `${course} курс`;
      const studentsData = await getAllStudents(idFaculty, course);

      const dynamicFieldsLength = studentsData.reduce(
        (prev, curr) => {
          for (const key in prev) {
            if (curr[key]?.length > prev[key]) {
              prev[key] = curr[key]?.length || 0;
            }
          }

          return prev;
        },
        {
          optionalSubjects: 0,
          internSubjects: 0,
          practices: 0,
          courseWorks: 0,
          stateExamination: 0,
        },
      );

      let sheet = xlsx.workBook.getWorksheet(courseStr);

      if (!sheet) {
        xlsx.createSheet(courseStr);
        sheet = xlsx.workBook.getWorksheet(courseStr);
      }

      await fillHeaders(sheet, pHeaders, dynamicFieldsLength);

      fillRows(sheet, studentsData, pHeaders);

      result[courseStr] = studentsData.length;
      result.total += studentsData.length;
    }

    await xlsx.saveTable('./data/marks');
    console.log(`✅ File ${facultyEnum[idFaculty]}.xlsx generated`);

    return result;
  } catch (err) {
    console.log(`❌ Error while generating file ${facultyEnum[idFaculty]}.xlsx`);
    console.error(err);
  }
};

const fillHeaders = async (sheet, headers, dynamicFieldsMax) => {
  const row = sheet.getRow(1);

  let prevDynamicData;

  for (const header of headers) {
    const style = header.required ? headerStyle : defaultCell;

    const finded = Object.keys(dynamicFieldsMax).find((el) => el === header.code);

    if (finded) {
      let findedLength = dynamicFieldsMax[finded];

      if (findedLength < 2) findedLength = 2;

      header.length = findedLength;

      if (prevDynamicData?.position) {
        header.position = prevDynamicData.position + prevDynamicData.length;
      }

      prevDynamicData = {
        position: header.position,
        length: header.length,
      };
    } else {
      prevDynamicData = {
        position: null,
        length: null,
      };
    }

    if (header.length) {
      sheet.mergeCells(1, header.position, 1, header.position + header.length - 1);

      let start = header.position;
      let end = header.position + header.length;

      Array(end - start)
        .fill()
        .map((_, idx) => start + idx)
        .map((el) => {
          sheet.getColumn(el).width = 25;
        });
    } else {
      sheet.getColumn(header.position).width = 25;
    }

    const cell = row.getCell(header.position);

    cell.value = header.name;
    cell.style = style;
  }

  row.heigth = 100;
};

const fillRows = (sheet, students, headers) => {
  let rowIndex = 2;

  for (const student of students) {
    const row = sheet.getRow(rowIndex);

    parseStudentData(student);

    for (const header of headers) {
      if (!student[header.code]) continue;

      if (!header.length) {
        row.getCell(header.position).value = student[header.code] || '';
      } else {
        let colNumber = header.position;

        for (const obj of student[header.code]) {
          row.getCell(colNumber).value = obj;
          row.getCell(colNumber).alignment = { wrapText: true };

          colNumber += 1;
        }
      }
    }

    rowIndex += 1;
  }
};

const parseStudentData = (student) => {
  student.internSubjects =
    student.internSubjects?.map((el) => {
      const { mark, subjectName, hoursInCredit, formControl, dateExam, course, teacher } = el;

      const parsedMark = parseMark(mark, formControl);
      const studyYears = getStudyYears(student.date_start, course);
      const date = parseDate(dateExam);

      if (!parseMark) console.log(mark);

      return `${subjectName}|${studyYears}|${hoursInCredit || 'ЗЕ'}|${parsedMark}|${date || 'ДАТА_АТТЕСТАЦИИ'}|${teacher || 'ПРЕПОДАВАТЕЛЬ'}`;
    }) || [];

  student.optionalSubjects =
    student.optionalSubjects?.map((el) => {
      const { mark, subjectName, hoursInCredit, formControl, dateExam, course, teacher } = el;

      const parsedMark = parseMark(mark, formControl);
      const studyYears = getStudyYears(student.date_start, course);
      const date = parseDate(dateExam);

      return `${subjectName}|${studyYears}|${hoursInCredit || 'ЗЕ'}|${parsedMark}|${date || 'ДАТА_АТТЕСТАЦИИ'}|${teacher || 'ПРЕПОДАВАТЕЛЬ'}`;
    }) || [];

  student.practices =
    student.practices?.map((el) => {
      const { subjectName, hoursInCredit, teacher } = el;

      const practiceType = getPracticeType(subjectName);

      return `${practiceType}|МЕСТО_ПРАКТИКИ|${hoursInCredit || 'ЗЕ'}|${teacher || 'ПРЕПОДАВАТЕЛЬ'}`;
    }) || [];

  student.courseWorks =
    student.courseWorks?.map((el) => {
      const { mark, subjectName, formControl, dateExam, teacher } = el;

      const parsedMark = parseMark(mark, formControl);
      const date = parseDate(dateExam);

      return `${subjectName}|ТЕМА_КР|${parsedMark}|${date || 'ДАТА_АТТЕСТАЦИИ'}|${teacher || 'ПРЕПОДАВАТЕЛЬ'}`;
    }) || [];

  const haveResearchWork = student.researchWork && student.researchWork.mark;
  const haveGraduationWork = student.graduationWork && student.graduationWork.mark;

  if (haveResearchWork) {
    student.researchWorkType = 'ВИД_НИРа';
    student.researchWorkMark = student.researchWork.mark;
    student.researchWorkDate = parseDate(student.researchWork.dateExam) || 'ДАТА_АТТЕСТАЦИИ';
    student.researchWorkTeacher = student.researchWork.teacher || 'ПРЕПОДАВАТЕЛЬ';
  }

  if (haveGraduationWork) {
    student.graduationWorkType = 'ВКР';
    student.graduationWorkTopic = 'ТЕМА_ВКР';
    student.graduationWorkDate = parseDate(student.graduationWork.dateExam) || 'ДАТА_АТТЕСТАЦИИ';
    student.graduationWorkMark = student.graduationWork.mark;
    student.graduationWorkProtocol = 'НОМЕР_ПРОТОКОЛА';
    student.graduationWorkProtocolDate = 'ДАТА_ПРОТОКОЛА';
  }

  const studentOrder = student.lastOrder;

  if (studentOrder) {
    if ([1, 12].includes(studentOrder.idType))
      student.recordBookIssued = `01.09.${student.date_start}`;
    else student.recordBookIssued = studentOrder.date;
  }
};

const getStudyYears = (startDate, course) => {
  const startYear = Number(startDate) + Number(course) - 1;
  const endYear = startYear + 1;

  return `${startYear}/${endYear}`;
};

const parseDate = (date) => {
  if (!date) return null;

  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
};

const getPracticeType = (practiceString) => {
  const practices = ['Ознакомительная', 'Преддипломная', 'Учебная', 'Вожатская'];

  for (const practice of practices) {
    if (practiceString.toLowerCase().includes(practice.toLowerCase())) return practice;
  }

  return practiceString;
};

const parseMark = (mark, formControl) => {
  if (formControl === 'зачет') {
    return mark === 1 ? 'зачет' : 'незачет';
  } else {
    const objMark = {
      1: 'неудовлетворительно',
      2: 'неудовлетворительно',
      3: 'удовлетворительно',
      4: 'хорошо',
      5: 'отлично',
    };

    if (!objMark) console.log(mark, formControl);

    return objMark[mark];
  }
};
