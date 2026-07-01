import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
import data from './oksm.json' with { type: 'json' };

const connection = jmuLocalConnection;

export const addCitizenshipToTable = async () => {
  const trx = await connection.transaction();

  try {
    let counter = 1;

    for (const item of data) {
      const { code, short, full } = item;

      await trx('citizenship').insert({
        oksm: code,
        short,
        full,
      });

      console.log(`${counter}/${data.length} Inserted citizenship: ${code} - ${short}`);

      counter++;
    }

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    console.error('Error adding citizenship data:', err);
  }
};
