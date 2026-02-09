import express from 'express';
import multer from 'multer';

import { abtConnection, jmuConnection, jmuLocalConnection } from './database/knexfile.js';
import { parsePsyhoResults } from './modules/addStudentCriticalPsyho/addStudentCriticalPsyho.js';
import { createMilitaryExcel } from './modules/createMilitaryExcel/createMilitaryExcel.js';
import { createStudentExcel } from './modules/createStudentExcel/createStudentExcel.js';
import { getStudentSummary } from './modules/createStudentSummary/createStudentSummary.js';
import { fillStudentsHostelInfo } from './modules/fillStudentsHostel/fillStudentsHostelInfo.js';
import { parseRelations } from './modules/insertTypeRelation/insertTypeRelation.js';
import { parseSkudNewTable } from './modules/parseSkudNewTable/parseSkudNewTable.js';
import { parseStudentHistory } from './modules/parseStudentHistory/parseStudentHistory.js';
import { parseMethodic } from './modules/processMethodicFour/processMethodic.js';
import { removeStudentCritical } from './modules/removeStudentCriticalPsyho/removeStudentCriticalPsyho.js';
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

app.post('/createStudentExcel', upload.single('file'), async (req, res) => {
  try {
    const dataFile = req.file;

    if (!dataFile) res.status(400).send('Отсутствует файл!');

    await createStudentExcel(dataFile);

    res.status(200).send('Ok');
  } catch (err) {
    console.log(err);

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

app.listen(5000, async () => {
  console.log(`Example app listening on port 5000`);

  await checkConnection('JMU', jmuConnection);
  await checkConnection('LOCAL JMU', jmuLocalConnection);
  await checkConnection('ABT', abtConnection);
});
