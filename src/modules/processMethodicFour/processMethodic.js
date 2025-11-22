import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
import { keysCriticalValue } from './criticalKeys.js';
import {
  processAdaptability,
  processProfessionalOrientation,
  processSuicide,
} from './testProcessing.js';

const connection = jmuConnection;

const getAllStudentsOfMethodic = (idTest) => {
  return connection('students_result').where('id_test', idTest);
};

const getAllStudentAnswers = (idStudent, idTest) => {
  return connection('students_answers as sa')
    .select({
      numberQuestion: 'q.number',
      position: 'a.position',
      ball: 'a.ball',
    })
    .innerJoin('answers as a', 'sa.id_answer', 'a.id')
    .innerJoin('questions as q', 'a.id_question', 'q.id')
    .where('q.id_test', idTest)
    .andWhere('sa.id_student', idStudent);
};

const updateStudentResult = (trx, result, idTest, idStudent) => {
  return trx('students_result')
    .update('result', result)
    .where('id_student', idStudent)
    .andWhere('id_test', idTest);
};

export const parseMethodic = async () => {
  const trx = await connection.transaction();

  try {
    const students = await getAllStudentsOfMethodic(1);

    let counter = 1;
    for (const student of students) {
      console.log(`Processing ${counter} of ${students.length}`);

      const answers = await getAllStudentAnswers(student.id_student, student.id_test);

      const result = processProfessionalOrientation(answers);

      for (const key in result) {
        if (keysCriticalValue[key]) result[`${key}Critical`] = keysCriticalValue[key];
      }

      await updateStudentResult(trx, result, student.id_test, student.id_student);

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
