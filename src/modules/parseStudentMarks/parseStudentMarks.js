import { writeFile } from 'fs/promises';
import path from 'path';

import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';

const connection = jmuConnection;

const insertPracticePlace = async (practicePlace) => {
  const res = await connection('practice_places').insert(
    {
      name: practicePlace,
    },
    'id',
  );

  return res[0].id;
};

const getPracticePlace = async (practicePlace) => {
  return await connection('practice_places').where('name', practicePlace).first();
};

const insertPracticeType = async (practiceType) => {
  const res = await connection('type_practice').insert(
    {
      name: practiceType,
    },
    'id',
  );

  return res[0].id;
};

const getPracticeType = async (practiceType) => {
  return await connection('type_practice').where('name', practiceType).first();
};

const findStudent = async (lastname, firstname, middlename, recordBook, uuid) => {
  const student = await connection('students as s')
    .select({
      idStudent: 's.id',
      idForm: 'gr.id_form',
      idStudentGroup: 'sg.id',
    })
    .innerJoin('students_groups as sg', 's.id', 'sg.id_student')
    .innerJoin('study_groups as gr', 'gr.id', 'sg.id_group')
    .where((builder) => {
      builder
        .whereILike('s.lastname', lastname)
        .andWhereILike('s.firstname', firstname)
        .andWhereILike('s.middlename', middlename);
    })
    .andWhere((builder) => {
      builder.where('sg.record_book', recordBook).orWhere('sg.gir_uuid', uuid);
    })
    .first();

  return student;
};

const getSubjectControls = async (idStudentGroup, course, idForm, lecturerFio, mark) => {
  const regexp = /^(\S+)\s+([А-ЯЁ])\.\s*([А-ЯЁ])\.$/;
  const [, lastname, firstname, middlename] = lecturerFio.trim().match(regexp);

  const isTrimester = idForm !== 1;
  const lastSemester = Number(course) * (isTrimester ? 3 : 2);
  const firstSemester = lastSemester - (isTrimester ? 2 : 1);

  const semesterArray = Array.from({ length: lastSemester - firstSemester + 1 }, (_, index) =>
    String(firstSemester + index),
  );

  const res = await connection('students_groups as sg')
    .select({
      id: 'psc.id',
      subjectName: 'ps.name',
      course: 'psc.course',
      semester: 'psc.semester',
      lecturer: connection.raw(`concat(p.firstname, ' ', p.name, ' ', p.lastname)`),
      mark: 'sm.ball_5',
      idSubjectControlTag: 'psc.id_subject_control_tag',
    })
    .innerJoin('plan_subjects_group as psg', 'sg.id_group', 'psg.id_group')
    .innerJoin('plan_subjects_control as psc', 'psc.id_subject_group', 'psg.id')
    .innerJoin('students_marks as sm', function () {
      this.on('sm.id_students_groups', '=', 'sg.id').andOn('sm.id_subject_control', '=', 'psc.id');
    })
    .innerJoin('plan_subjects as ps', 'psg.id_subject', 'ps.id')
    .innerJoin('pers.Persons as p', 'p.id', 'psc.idWorker')
    .where('sg.id', idStudentGroup)
    .whereIn('psc.semester', semesterArray)
    .andWhere((builder) => {
      if (lastname) builder.whereILike('p.firstname', `%${lastname}%`);
      if (firstname) builder.andWhereILike('p.name', `%${firstname[0]}%`);
      if (middlename) builder.andWhereILike('p.lastname', `%${middlename[0]}%`);
    })
    .andWhere('sm.ball_5', mark);

  return res;
};

const insertStudentPractice = async (trx, data) => {
  await trx('practices').insert(data);
};

const convertMark = (mark) => {
  const numberMark = Number(mark);

  if (!numberMark) {
    const markKeysObj = {
      зачтено: 1,
      'не зачтено': 0,
      неудовлетворительно: 2,
      удовлетворительно: 3,
      хорошо: 4,
      отлично: 5,
    };
    const parsedMark = mark.trim().toLowerCase();

    if (markKeysObj[parsedMark]) return markKeysObj[parsedMark];

    throw new Error(
      `❌ Не удалось преобразовать оценку ${mark}. Трансформированный вид: ${parsedMark}`,
    );
  }

  return numberMark;
};

export const parseStudentMarks = async (data, fileName = '') => {
  const trx = await connection.transaction();
  const failedToFind = [];

  const PracticeTypeMap = new Map();
  const PracticePlaceMap = new Map();

  try {
    console.log(`⚪️ Начало обработки файла: ${fileName}`);
    console.log('⚪️ Начало парсинга студентов');
    console.log('⚪️ Проверяем места практик');
    // Проверяем и создаем места практик
    for (const practicePlace of data.uniqueData.practiceLocations) {
      const isExist = await getPracticePlace(practicePlace.trim());
      let idPracticePlace = isExist?.id;

      if (!idPracticePlace) {
        idPracticePlace = await insertPracticePlace(practicePlace.trim());
      }

      PracticePlaceMap.set(practicePlace.trim(), idPracticePlace);
    }
    console.log('✅ Проверка/создание мест практик завершены');

    console.log('⚪️ Проверяем места практик');
    // Проверяем и создаем типы практик
    for (const practiceType of data.uniqueData.practiceTypes) {
      const isExist = await getPracticeType(practiceType.trim());
      let idPracticeType = isExist?.id;

      if (!idPracticeType) {
        idPracticeType = await insertPracticeType(practiceType.trim());
      }

      PracticeTypeMap.set(practiceType.trim(), idPracticeType);
    }
    console.log('✅ Проверка/создание типов практик завершены');

    console.log('⚪️ Начало обработки оценок обучающихся');
    // Парсим оценки обучающихся
    for (const student of data.students) {
      console.log('⚪️ Поиск студента в базе');
      const findedStudent = await findStudent(
        student.lastname,
        student.firstname,
        student.middlename,
        student.recordBook,
        student.uuid,
      );

      if (!findedStudent) {
        failedToFind.push(student);
        // If last student - trx. coomit()
        if (student.uuid === data.students[data.students.length - 1].uuid) {
          await trx.commit();
        }

        continue;
      }

      console.log(
        `✅ Студент ${student.lastname} ${student.firstname} ${student.middlename} найден`,
      );

      student.practices = Object.values(
        student.practices.reduce((acc, item) => {
          const key = JSON.stringify(item);

          acc[key] ??= {
            ...item,
            count: 0,
          };

          acc[key].count += 1;

          return acc;
        }, {}),
      );

      console.log('⚪️ Обработка практик студента');
      for (const practice of student.practices) {
        const { hoursInCredits, lecturer, mark, organization, type } = practice;
        console.log(
          `⚪️ Обработка практики: ${student.course} курс - ${type} - ${organization} - ${lecturer} - ${hoursInCredits} - ${mark}`,
        );

        const convertedMark = convertMark(mark);

        const subjectControls = await getSubjectControls(
          findedStudent.idStudentGroup,
          student.course,
          findedStudent.idForm,
          lecturer,
          convertedMark,
        );

        for (const subjectControl of subjectControls) {
          await insertStudentPractice(trx, {
            id_subject_control: subjectControl.id,
            id_student_group: findedStudent.idStudentGroup,
            id_place: PracticePlaceMap.get(organization.trim()),
            id_type: PracticeTypeMap.get(type.trim()),
          });
        }
      }
    }

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    console.log(err?.message || err);
  }

  console.log('✅ Обработка завершена');
  console.log(`⚪️ Кол-во ошибок: ${failedToFind.length}/${data.students.length}`);

  await writeFile(
    path.resolve(path.join(import.meta.dirname, 'result'), fileName),
    JSON.stringify({
      errors: failedToFind.length,
      total: data.students.length,
      errorData: failedToFind,
    }),
  );
};
