import xlsx from 'exceljs';
import { access, mkdir, writeFile } from 'fs/promises';
import { Readable } from 'stream';

import { jmuLocalConnection } from '../../database/knexfile.js';

const connection = jmuLocalConnection;

const checkDirectory = async (path) => {
  try {
    await access(path);
  } catch {
    await mkdir(path, { recursive: true });
  }
};

const getStudentsGroupsBySnils = (snils) => {
  return connection('students_groups as sg')
    .select('sg.id', 'sg.record_book')
    .innerJoin('students as s', 's.id', 'sg.id_student')
    .whereRaw(`regexp_replace(s.snils, '\\D', '', 'g') = ?`, [snils])
    .whereIn('sg.status', [0, 1, 2, 5]);
};

const updateStudentGroupGirUuid = (trx, studentGroupId, girUuid) => {
  return trx('students_groups').where('id', studentGroupId).update({ gir_uuid: girUuid });
};

export const addStudentGirUuid = async (file) => {
  const errors = [];
  const errorsPath = './data/gir';
  let errorData;

  const dataTable = new xlsx.Workbook();

  const dataSheet = await dataTable.csv.read(Readable.from(file.buffer.toString()));

  const trx = await connection.transaction();

  try {
    let counter = 0;
    const lastRowNumber = dataSheet.lastRow.number;

    for (let i = 2; i <= lastRowNumber; i++) {
      const row = dataSheet.getRow(i);

      const recordBook = row.getCell(7).value;
      const snilsNumber = row.getCell(6).value;
      const uuid = row.getCell(2).value;

      const studentGroups = await getStudentsGroupsBySnils(String(snilsNumber).replace(/\D/g, ''));

      const findedGroup = studentGroups.find((el) => el.record_book === recordBook);

      errorData = {
        recordBook,
        snilsNumber,
        uuid,
        studentGroups,
      };

      if (!findedGroup && !findedGroup?.id) {
        const isOneGroup = studentGroups.length === 1;

        if (isOneGroup) {
          await updateStudentGroupGirUuid(trx, studentGroups[0].id, uuid);
        } else {
          errors.push({
            recordBook,
            snilsNumber,
          });

          continue;
        }
      } else {
        await updateStudentGroupGirUuid(trx, findedGroup.id, uuid);
      }

      counter++;
    }

    await trx.commit();
    console.log(`Успешно обновлено ${counter} записей из ${lastRowNumber - 1}`);

    await checkDirectory(errorsPath);
    await writeFile(`${errorsPath}/errors.json`, JSON.stringify(errors));
    return counter;
  } catch (err) {
    console.error('Ошибка:', err);
    console.log(`Error data:\n ${JSON.stringify(errorData)}`);
    await trx.rollback();
  }
};
