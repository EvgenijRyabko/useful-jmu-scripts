import 'dotenv/config';

import knex from 'knex';

const {
  JMU_HOST,
  JMU_LOCAL_HOST,
  JMU_USER,
  JMU_PASSWORD,
  JMU_DATABASE,
  ABT_HOST,
  ABT_USER,
  ABT_PASSWORD,
  ABT_DATABASE,
} = process.env;

export const jmuConnection = knex({
  client: 'pg',
  connection: {
    host: JMU_HOST,
    user: JMU_USER,
    password: JMU_PASSWORD,
    database: JMU_DATABASE,
    connectionTimeoutMillis: 2000,
  },
  pool: {
    min: 0,
    max: 50,
  },
  searchPath: ['education', 'pers', 'psyho'],
});

export const jmuLocalConnection = knex({
  client: 'pg',
  connection: {
    host: JMU_LOCAL_HOST,
    user: JMU_USER,
    password: JMU_PASSWORD,
    database: JMU_DATABASE,
  },
  pool: {
    min: 0,
    max: 50,
  },
  searchPath: ['education', 'pers', 'psyho'],
});

export const abtConnection = knex({
  client: 'mysql',
  connection: {
    host: ABT_HOST,
    user: ABT_USER,
    password: ABT_PASSWORD,
    database: ABT_DATABASE,
    connectionTimeoutMillis: 2000,
  },
  pool: {
    min: 0,
    max: 50,
  },
});
