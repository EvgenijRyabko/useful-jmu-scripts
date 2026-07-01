import express from 'express';
import multer from 'multer';

import { abtConnection, jmuConnection, jmuLocalConnection } from './database/knexfile.js';
import { addCitizenshipToTable } from './modules/addCitizenship/addCitizenship.js';
import { parsePsyhoResults } from './modules/addStudentCriticalPsyho/addStudentCriticalPsyho.js';
import { addStudentGirUuid } from './modules/addStudentGirUuid/addStudentGirUuid.js';
import { createMarksExcel } from './modules/createMarksExcel/createMarks.js';
import { createMilitaryExcel } from './modules/createMilitaryExcel/createMilitaryExcel.js';
import { createStudentExcel } from './modules/createStudentExcel/createStudentExcel.js';
import { getStudentSummary } from './modules/createStudentSummary/createStudentSummary.js';
import { fillStudentsHostelInfo } from './modules/fillStudentsHostel/fillStudentsHostelInfo.js';
import { parseCathedralFiles } from './modules/getCathedralsFromExcel/index.js';
import { parseRelations } from './modules/insertTypeRelation/insertTypeRelation.js';
import { parseSkudNewTable } from './modules/parseSkudNewTable/parseSkudNewTable.js';
import { parseStudentHistory } from './modules/parseStudentHistory/parseStudentHistory.js';
import { parseMethodic } from './modules/processMethodicFour/processMethodic.js';
import { removeStudentCritical } from './modules/removeStudentCriticalPsyho/removeStudentCriticalPsyho.js';
import { transferGroup } from './modules/transferGroup/transferGroup.js';
import { checkConnection } from './utils/checkConnection.js';

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/parseRelations', async (req, res) => {
  try {
    await parseRelations();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/createStudentSummary', async (req, res) => {
  const { idForm, yearAdmission } = req.body;
  const pIdForm = Number(idForm);
  const pYearAdmission = String(yearAdmission);

  if (!pIdForm) res.status(400).send('idForm was not provided!');
  if (!pYearAdmission || !/^\d{4}$/.test(pYearAdmission))
    res.status(400).send('yearAdmission is not provided or failed validation!');

  try {
    await getStudentSummary(pYearAdmission, pIdForm);

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/fillStudentsHostel', async (req, res) => {
  try {
    await fillStudentsHostelInfo();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/createMilitaryExcel', async (req, res) => {
  try {
    await createMilitaryExcel();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/createMarksExcel', async (req, res) => {
  try {
    await createMarksExcel();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/addStudentGirUuid', upload.single('file'), async (req, res) => {
  try {
    const dataFile = req.file;

    if (!dataFile) res.status(400).send('Отсутствует файл!');

    const total = await addStudentGirUuid(dataFile);

    res.status(200).send({ total });
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/createStudentExcel', upload.single('file'), async (req, res) => {
  try {
    const dataFile = req.file;

    if (!dataFile) res.status(400).send('Отсутствует файл!');

    const fileName =
      Buffer.from(dataFile.originalname, 'latin1').toString('utf8').split('.')[0] || 'data';

    const total = await createStudentExcel(dataFile, fileName);

    res.status(200).send({ total });
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/createStudentExcelMultiple', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;

    if (!files || !files.length) res.status(400).send('Отсутствуют файлы!');

    const resObj = {};

    for (const file of files) {
      const fileName =
        Buffer.from(file.originalname, 'latin1').toString('utf8').split('.')[0] || 'data';

      const total = await createStudentExcel(file, fileName);

      console.log(`File ${fileName} processed, total students: ${total}`);

      resObj[fileName] = total;
    }

    res.status(200).send(resObj);
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/parsePsyhoResults', async (req, res) => {
  try {
    await parsePsyhoResults();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/parseMethodic', async (req, res) => {
  try {
    await parseMethodic();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.delete('/deleteCriticalKeys', async (req, res) => {
  try {
    await removeStudentCritical();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/parseSkudNewTable', async (req, res) => {
  try {
    await parseSkudNewTable();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/parseStudentHistory', async (req, res) => {
  try {
    await parseStudentHistory();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/transferGroup', async (req, res) => {
  const groups = [
    // // Культ обр. ФМХО -> ИФиСК || 44.03.01 и 44.04.01
    // { from: 1368, to: 1448 },
    // { from: 1152, to: 1449 },
    // { from: 797, to: 1450 },
    // { from: 1367, to: 1452 },
    // { from: 1153, to: 1453 },
    // { from: 799, to: 1454 },
    // { from: 1378, to: 1456 },
    // { from: 1381, to: 1457 },
    // // ИЗО. ФМХО -> ИППиИМХО || 44.03.01 и 44.04.01
    // { from: 1369, to: 1458 },
    // { from: 1154, to: 1462 },
    // { from: 795, to: 1466 },
    // { from: 1380, to: 1470 },
    // // Доп Обр. ФМХО -> ИППиИМХО || 44.03.01 и 44.04.01
    // { from: 1365, to: 1459 },
    // { from: 1150, to: 1463 },
    // { from: 798, to: 1467 },
    // { from: 1377, to: 1471 },
    // // Муз Обр. ФМХО -> ИППиИМХО || 44.03.01 и 44.04.01
    // { from: 1366, to: 1460 },
    // { from: 1155, to: 1464 },
    // { from: 794, to: 1468 },
    // { from: 1379, to: 1472 },
    // // ТХОМ. ФМХО -> ИППиИМХО || 44.03.04
    // { from: 1364, to: 1461 },
    // { from: 1151, to: 1465 },
    // { from: 796, to: 1469 },
    // БЖД, ИФМОИОТ > ИФВС || 44.03.04
    // { from: 1308, to: 1473 },
    // { from: 1205, to: 1475 },
    // { from: 767, to: 1476 },
    { from: 1398, to: 1478 },
  ];

  try {
    for (const group of groups) {
      await transferGroup(group.from, group.to, 7365);
    }

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/getCathedralsFromExcel', async (req, res) => {
  try {
    await parseCathedralFiles();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.post('/addCitizenship', async (req, res) => {
  try {
    await addCitizenshipToTable();

    res.status(200).send('Ok');
  } catch (err) {
    res.status(500).send(err?.message || err);
  }
});

app.listen(5000, async () => {
  console.log(`Example app listening on port 5000`);

  await checkConnection('JMU', jmuConnection);
  await checkConnection('LOCAL JMU', jmuLocalConnection);
  await checkConnection('ABT', abtConnection);
});
