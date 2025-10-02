import express from 'express';
import multer from 'multer';

import { abtConnection, jmuConnection, jmuLocalConnection } from './database/knexfile.js';
import { getStudentSummary } from './modules/createStudentSummary/createStudentSummary.js';
import { parseRelations } from './modules/insertTypeRelation/insertTypeRelation.js';
import { checkConnection } from './utils/checkConnection.js';

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());

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

app.listen(5000, async () => {
  console.log(`Example app listening on port 5000`);

  await checkConnection('JMU', jmuConnection);
  await checkConnection('LOCAL JMU', jmuLocalConnection);
  await checkConnection('ABT', abtConnection);
});
