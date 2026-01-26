import { jmuConnection } from '../../database/knexfile.js';

const fileConnection = jmuConnection;

export const parseSkudNewTable = async () => {
  const trx = await fileConnection.transaction();

  try {
    const students = await fileConnection('students')
      .select('id', 'skud_card')
      .whereRaw(`skud_card !~ '^\\s*$'`);

    let counter = 1;
    for (const student of students) {
      const { id, skud_card } = student;

      await fileConnection('students_skud').insert({
        id_student: id,
        skud: skud_card,
      });

      console.log(`${counter}/${students.length}::${id}_${skud_card}`);
      counter += 1;
    }

    await trx.commit();
  } catch (err) {
    console.log(`❌ ${err?.message || err}`);

    await trx.rollback();
    throw new Error(err?.message || err);
  }
};
