import express from 'express';

import { abtConnection, jmuConnection, jmuLocalConnection } from './database/knexfile.js';
import { parseRelations } from './modules/insertTypeRelation/insertTypeRelation.js';
import { checkConnection } from './utils/checkConnection.js';

const app = express();

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

app.listen(5000, async () => {
  console.log(`Example app listening on port 5000`);

  await checkConnection('JMU', jmuConnection);
  await checkConnection('LOCAL JMU', jmuLocalConnection);
  await checkConnection('ABT', abtConnection);
});
