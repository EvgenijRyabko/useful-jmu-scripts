import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
import { keysCriticalValue } from './criticalKeys.js';
import { processAdaptability, processSuicide } from './testProcessing.js';

const connection = jmuConnection;

const getAllStudentsOfMethodic = (idTest) => {
  return connection('students_result').where('id_test', idTest);
};

const getAllStudentAnswers = (idStudent, idTest) => {
  return connection('students_answers as sa')
    .select({
      numberQuestion: 'q.number',
      ball: 'a.ball',
    })
    .innerJoin('answers as a', 'sa.id_answer', 'a.id')
    .innerJoin('questions as q', 'a.id_question', 'q.id')
    .where('q.id_test', idTest)
    .andWhere('sa.id_student', idStudent);
};

const insertStudentResult = (trx, idTest, idStudent, result) => {
  return trx('students_result').insert({
    id_test: idTest,
    id_student: idStudent,
    result,
  });
};

const deletePreviousResults = (trx, idTest, idStudent) => {
  return trx('students_result').delete().where('id_test', idTest).andWhere('id_student', idStudent);
};

export const parseMethodic = async () => {
  const trx = await connection.transaction();

  try {
    const students = await getAllStudentsOfMethodic(3);

    let counter = 1;
    for (const student of students) {
      console.log(`Processing ${counter} of ${students.length}`);

      const answers = await getAllStudentAnswers(student.id_student, student.id_test);

      const result = processSuicide(answers);

      for (const key in result) {
        if (keysCriticalValue[key]) result[`${key}Critical`] = keysCriticalValue[key];
      }

      await deletePreviousResults(trx, student.id_test, student.id_student);

      await insertStudentResult(trx, student.id_test, student.id_student, result);

      counter += 1;
    }

    // throw 'err';
    await trx.commit();
    console.log(`processed: ${students.length} elements`);
  } catch (err) {
    await trx.rollback();
    console.log(err?.message || err);
  }
};
