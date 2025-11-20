import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
// Это у нас был ИЕН, ИММОСПН и ИФМОИОТ
// import data from './data.json' with { type: 'json' };
import data from './data/imho.json' with { type: 'json' };

export const fillStudentsHostelInfo = async () => {
  const trx = await jmuConnection.transaction();

  const HostelEnum = Object.freeze({
    7: 67,
    5: 66,
    4: 65,
    3: 64,
    2: 63,
  });

  try {
    for (const student of data) {
      if (!student.hostel)
        throw `❌ Not finded: [${student.lastname} ${student.firstname} ${student.middlename}] hostel!`;

      const findedStudent = await trx('students')
        .where((builder) => {
          if (student.lastname) builder.whereILike('lastname', `%${student.lastname?.trim()}%`);
          if (student.firstname) builder.whereILike('firstname', `%${student.firstname?.trim()}%`);
          if (student.middlename)
            builder.whereILike('middlename', `%${student.middlename?.trim()}%`);
        })
        .first();

      if (!findedStudent)
        throw `❌ Not finded: [${student.lastname} ${student.firstname} ${student.middlename}]`;

      await trx('students')
        .update({
          id_hostel: HostelEnum[student.hostel],
          is_hostel: true,
        })
        .where('id', findedStudent.id);
    }

    console.log(`✅ Hostel fill finished!`);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    console.log(err?.message || err);
  }
};
