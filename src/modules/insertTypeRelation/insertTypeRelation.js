import { jmuLocalConnection } from '../../database/knexfile.js';
import { relationEnum } from './relationVariants.enum.js';

export const parseRelations = async () => {
  const trx = await jmuLocalConnection.transaction();

  try {
    const allStudentRelations = await jmuLocalConnection('students_relatives').select(
      'id',
      'type_relationship',
    );

    for (const relation of allStudentRelations) {
      const idRelationType = relationEnum[relation.type_relationship];

      await trx('students_relatives')
        .update({ id_type_relation: idRelationType })
        .where('id', relation.id);
    }

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw new Error(err?.message || err);
  }
};
