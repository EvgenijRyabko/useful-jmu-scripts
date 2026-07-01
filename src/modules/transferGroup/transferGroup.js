import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';

const connection = jmuConnection;

const getStudentsGroups = (idGroup) => {
  return connection('students_groups').where('id_group', idGroup);
};

const getStudentGroup = async (idGroup, idStudent) => {
  return connection('students_groups')
    .where('id_student', idStudent)
    .andWhere('id_group', idGroup)
    .first();
};

const createNewStudentsGroups = (trx, oldData, newGroupId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_group, ...rest } = oldData;

  return trx('students_groups').insert(
    {
      id_group: newGroupId,
      ...rest,
    },
    'id',
  );
};

const updateOldStudentGroup = (trx, id) => {
  return trx('students_groups').update('status', 3).where('id', id);
};

const updateOldGroup = (trx, id) => {
  return trx('study_groups').update('closed', true).where('id', id);
};

const updateNewGroup = (trx, id) => {
  return trx('study_groups').update('closed', false).where('id', id);
};

const createStudentGroupOrder = (trx, idOrder, idStudentGroup) => {
  console.log(idStudentGroup, idOrder);

  return trx('students_groups_orders').insert({
    id_students_groups: idStudentGroup,
    id_order: idOrder,
  });
};

const getPlanSubjectGroups = (idGroup) => {
  return connection('plan_subjects_group').where('id_group', idGroup);
};

const createSubjectGroup = (trx, oldData, newGroupId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_group, ...rest } = oldData;

  return trx('plan_subjects_group').insert(
    {
      id_group: newGroupId,
      ...rest,
    },
    'id',
  );
};

const getSubjectGroups = (subjectGroupId) => {
  return connection('plan_subjects_control').where('id_subject_group', subjectGroupId);
};

const createSubjectControl = (trx, oldData, newSubjectGroupId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_subject_group, ...rest } = oldData;

  return trx('plan_subjects_control').insert(
    {
      id_subject_group: newSubjectGroupId,
      ...rest,
    },
    'id',
  );
};

const getAcademinHours = (idSubjectControl) => {
  return connection('plan_subjects_academic_hours').where('id_subject_control', idSubjectControl);
};

const getCreditUnits = (idSubjectControl) => {
  return connection('plan_subjects_credit_units').where('id_subject_control', idSubjectControl);
};

const getWorks = (idSubjectControl) => {
  return connection('plan_subjects_works').where('id_subject_control', idSubjectControl);
};

const createAcademicHours = (trx, oldData, newSubjectControlId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_subject_control, ...rest } = oldData;

  return trx('plan_subjects_academic_hours').insert({
    id_subject_control: newSubjectControlId,
    ...rest,
  });
};

const createCreditUnits = (trx, oldData, newSubjectControlId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_subject_control, ...rest } = oldData;

  return trx('plan_subjects_credit_units').insert({
    id_subject_control: newSubjectControlId,
    ...rest,
  });
};

const createWorks = (trx, oldData, newSubjectControlId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_subject_control, ...rest } = oldData;

  return trx('plan_subjects_works').insert({
    id_subject_control: newSubjectControlId,
    ...rest,
  });
};

const getStudentMarks = (idSubjectControl, idStudentGroup) => {
  return connection('students_marks')
    .where('id_subject_control', idSubjectControl)
    .andWhere('id_students_groups', idStudentGroup);
};

const insertStudentMark = (trx, oldData, newSubjectControlId, newStudentGroupId) => {
  // eslint-disable-next-line no-unused-vars
  const { id, id_subject_control, id_students_groups, ...rest } = oldData;

  return trx('students_marks').insert({
    id_subject_control: newSubjectControlId,
    id_students_groups: newStudentGroupId,
    ...rest,
  });
};

export const transferGroup = async (idGroupFrom, idGroupTo, idOrder) => {
  const trx = await connection.transaction();

  try {
    console.log(`=== Группа { ${idGroupFrom} - ${idGroupTo} } ===`);
    const sgIds = [];

    // Копирование students_groups
    console.log(`Шаг 1. === Получение данных о студентах в группе ===`);
    const studentsGroups = await getStudentsGroups(idGroupFrom);

    console.log(`Шаг 2. === Копирование данных в новую группу ===`);
    for (const studentGroup of studentsGroups) {
      const [{ id: newStudentGroupId }] = await createNewStudentsGroups(
        trx,
        studentGroup,
        idGroupTo,
      );

      await updateOldStudentGroup(trx, studentGroup.id);
      await updateOldGroup(trx, idGroupFrom);
      await updateNewGroup(trx, idGroupTo);
      await createStudentGroupOrder(trx, idOrder, newStudentGroupId);

      // const newStudentGroup = await getStudentGroup(idGroupTo, studentGroup.id_student);

      await sgIds.push({
        oldId: studentGroup.id,
        newId: newStudentGroupId,
      });
    }

    console.log(`Шаг 3. === Получение данных о предметах в плане для группы ===`);
    // Копирование плана из прошлой группы
    const planSubjectGroups = await getPlanSubjectGroups(idGroupFrom);

    console.log(`Шаг 4. === Копирование плана в новую группу ===`);
    let subjectGroupCounter = 1;
    for (const subjectGroup of planSubjectGroups) {
      console.log(`- ${subjectGroupCounter}. === Создание предмета на группу ===`);
      const [{ id: newSubjectGroupId }] = await createSubjectGroup(trx, subjectGroup, idGroupTo);

      const subjectControls = await getSubjectGroups(subjectGroup.id);

      console.log(`- ${subjectGroupCounter}. === Создание subjectControls ===`);
      let subjectControlCounter = 1;
      for (const subjectControl of subjectControls) {
        const [{ id: newSubjectControlId }] = await createSubjectControl(
          trx,
          subjectControl,
          newSubjectGroupId,
        );

        const academicHours = await getAcademinHours(subjectControl.id);
        const creditUnits = await getCreditUnits(subjectControl.id);
        const works = await getWorks(subjectControl.id);

        console.log(`-- ${subjectControlCounter}. === Создание academicHours ===`);
        for (const academicHour of academicHours) {
          await createAcademicHours(trx, academicHour, newSubjectControlId);
        }

        console.log(`-- ${subjectControlCounter}. === Создание creditUnits ===`);
        for (const creditUnit of creditUnits) {
          await createCreditUnits(trx, creditUnit, newSubjectControlId);
        }

        console.log(`-- ${subjectControlCounter}. === Создание works ===`);
        for (const work of works) {
          await createWorks(trx, work, newSubjectControlId);
        }

        console.log(`-- ${subjectControlCounter}. === Копирование оценок из прошлой группы ===`);
        // Копирование оценок из прошлого плана
        for (const sgId of sgIds) {
          const marks = await getStudentMarks(subjectControl.id, sgId.oldId);

          for (const mark of marks) {
            await insertStudentMark(trx, mark, newSubjectControlId, sgId.newId);
          }
        }

        subjectControlCounter += 1;
      }
      subjectGroupCounter += 1;
    }

    await trx.commit();
    console.log(
      `Переведено ${studentsGroups.length} студентов из группы ${idGroupFrom} в ${idGroupTo}`,
    );
  } catch (err) {
    await trx.rollback();
    console.log(err?.message || err);
  }
};
