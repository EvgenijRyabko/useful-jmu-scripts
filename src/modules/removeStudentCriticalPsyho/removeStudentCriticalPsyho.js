import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';

const connection = jmuConnection;

const getStudentResult = (idTest) => {
  return connection('students_result').where('id_test', idTest);
};

const updateStudentsResults = (trx, id, result) => {
  return trx('students_result').where('id', id).update({ result });
};

export const removeStudentCritical = async () => {
  const trx = await connection.transaction();

  const keysToDelete = ['completedCritical'];

  try {
    const students_results = await getStudentResult(5);

    let counter = 1;
    for (const result of students_results) {
      console.log(`Processed ${counter} of ${students_results.length}`);
      const parsedResult = result.result;

      for (const key of keysToDelete) {
        if (parsedResult[key]) {
          delete parsedResult[key];
          console.log(parsedResult);
        }
      }

      await updateStudentsResults(trx, result.id, JSON.stringify(parsedResult));

      counter += 1;
    }

    await trx.commit();
    console.log(`Processed ${students_results.length} elements`);
  } catch (err) {
    await trx.rollback();
    console.log(err?.message || err);
  }
};
