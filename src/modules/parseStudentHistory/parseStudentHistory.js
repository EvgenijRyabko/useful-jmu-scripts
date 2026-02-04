import { jmuConnection } from '../../database/knexfile.js';

const connection = jmuConnection;

const getStudentsWithHistory = () => {
  return connection('students')
    .select('id', 'history')
    .whereRaw(`jsonb_array_length(history::jsonb->'lastname') > 0`);
};

const insertStudentHistory = (trx, idStudent, lastname, idOrder) => {
  return trx('students_history').insert({
    id_student: idStudent,
    id_order: idOrder,
    old_lastname: lastname,
  });
};

export const parseStudentHistory = async () => {
  const trx = await connection.transaction();
  try {
    const students = await getStudentsWithHistory();
    let counter = 1;

    for (const student of students) {
      const { id, history } = student;

      const { lastname: lastnameChangeArr } = history;

      for (const lastnameChange of lastnameChangeArr) {
        const { idOrder, name } = lastnameChange;

        await insertStudentHistory(trx, id, name, idOrder);
      }

      console.log(`${counter}/${students.length}::${id}`);
      counter += 1;
    }

    await trx.commit();
    console.log(`✅ ${students.length} records processed successfully.`);
  } catch (err) {
    await trx.rollback();
    console.log(`❌ ${err?.message || err}`);
  }
};
