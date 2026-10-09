import fs from 'fs/promises';
import path from 'path';

import { parseStudentMarks } from './parseStudentMarks.js';

const DATA_DIR = path.join(process.cwd(), 'src/modules/parseStudentMarks/data');

async function getJsonFilesRecursive(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await getJsonFilesRecursive(fullPath);
      files.push(...nestedFiles);
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.json') {
      files.push(fullPath);
    }
  }

  return files;
}

async function readJsonFile(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export async function parseAllMarksFiles() {
  const files = await getJsonFilesRecursive(DATA_DIR);

  console.log(`Найдено JSON-файлов: ${files.length}`);

  for (const filePath of files) {
    const relativePath = path.relative(DATA_DIR, filePath);

    console.log(`Обработка: ${relativePath}`);

    try {
      const data = await readJsonFile(filePath);

      await parseStudentMarks(data, relativePath.split('/')[1]);
    } catch (err) {
      console.log(`Не удалось обработать файл: ${relativePath}`);
      console.log(err?.message || err);
    }
  }

  console.log('Обработка всех файлов завершена');
}
