import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
import { keysCriticalValue } from './criticalKeys.js';

const fileConnection = jmuLocalConnection;

const getAllResults = () => {
  return fileConnection('students_result').where('id_test', 10);
};

const parseResultObj = (data) => {
  const res = { ...data };

  for (const key in res) {
    if (keysCriticalValue[key]) res[`${key}Critical`] = keysCriticalValue[key];
  }

  return res;
};

export const parsePsyhoResults = async () => {
  const results = await getAllResults();

  console.log(results.length);

  const trx = await fileConnection.transaction();

  try {
    for (const result of results) {
      const data = result.result;

      const parsedObj = parseResultObj(data);

      await trx('students_result').update({ result: parsedObj }).where('id', result.id);
    }

    await trx.commit();
    console.log('Done');
  } catch (err) {
    await trx.rollback();
    console.log(err?.message || err);
  }
};
