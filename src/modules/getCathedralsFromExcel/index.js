import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { ExcelTable } from '../../utils/excel.fileGenerator.js';

const getCathedralsFromExcel = async (file, resObj) => {
  const excel = new ExcelTable('temp');

  const dataTable = await excel.workBook.xlsx.load(file);

  const sheet = dataTable.getWorksheet('Кафедры');

  if (!sheet) return;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const code = row.getCell(1).value;
      const name = row.getCell(3).value;

      if (resObj[name]) {
        resObj[name].find((el) => el === code) || resObj[name].push(code);
      } else resObj[name] = [code];
    }
  });
};

export const parseCathedralFiles = async () => {
  const response = {};

  try {
    const filePath = path.resolve(import.meta.dirname, 'files');

    const files = await readdir(filePath);

    let index = 1;
    for (const file of files) {
      console.log(`[ ${index} / ${files.length} ] - Processing file: ${file}`);
      const fileData = await readFile(path.resolve(filePath, file));

      await getCathedralsFromExcel(fileData, response);

      index++;
      console.clear();
    }

    await writeFile(path.resolve(import.meta.dirname, 'result.json'), JSON.stringify(response));
  } catch (err) {
    console.error('Error processing cathedral files:', err);
  }
};
