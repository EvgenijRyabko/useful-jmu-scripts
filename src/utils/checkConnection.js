import knex from 'knex';

const { Knex } = knex;

/**
 * @description Метод для проверки соединения к БД
 * @param {string} name
 * @param {Knex} connection
 */
export const checkConnection = async (name, connection) => {
  try {
    await connection.raw('select 1+1 as sum');

    console.log(`✅ Подключение к базе ${name} установлено!`);
  } catch (err) {
    console.log(
      `❌ Ошибка при попытке установки соединения к ${name}!\nОшибка: ${err?.error || err}`,
    );
  }
};
