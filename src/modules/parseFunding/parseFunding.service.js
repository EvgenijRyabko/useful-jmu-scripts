import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';
import { getBasisLearning, getOrders, getStudentAndGroupInfo } from './repo.js';

const connection = jmuConnection;

const parseFunding = async () => {
  const trx = await connection.transaction();
  const basisObj = {
    Бюджет: 1,
    Контракт: 2,
  };

  const errors = [];

  try {
    const studentGroups = await connection('students_groups');

    let counter = 0;
    for (const studentGroup of studentGroups) {
      const basis = await typeBasis(studentGroup.id);

      if (!basisObj[basis]) {
        errors.push({
          studentGroup,
          basis,
        });
        continue;
      }

      await trx('students_groups')
        .update('id_funding', basisObj[basis])
        .where('id', studentGroup.id);

      counter++;
      console.log(`${counter} из ${studentGroups.length}`);
    }

    console.log(`parsed ${counter}/${studentGroups.length}`);
    await trx.commit();

    return errors;
  } catch (err) {
    await trx.rollback();
    console.error(err?.message || err);
  }
};

async function typeBasis(idStudentGroup) {
  let basis = await getBasisLearning(idStudentGroup);

  if (!basis) {
    const studentAndGroupInfo = await getStudentAndGroupInfo(idStudentGroup);

    if (!studentAndGroupInfo)
      throw new Error(
        `Нет информации о текущей группе и студенте: идентификатор ${idStudentGroup}`,
      );

    const orders = await getOrders(studentAndGroupInfo.id_student);

    basis = getOuterBasisLearning(orders, studentAndGroupInfo.id_group);
  }
  if (!basis) {
    return 'Не определено';
  }

  return basis.order_type_id === 1 || basis.order_type_id === 2 || basis.order_type_id === 7
    ? 'Бюджет'
    : 'Контракт';
}

function getOuterBasisLearning(orders, idGroup) {
  let validDateOrders = orders.map((order) => {
    // * Формат даты в базе - DD.MM.YYYY
    const splittedDate = order.date.trim().split('.');
    return {
      ...order,
      date: new Date(`${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`),
    };
  });

  if (validDateOrders.length === 1 && validDateOrders[0].order_type_id !== 9)
    return validDateOrders[0];

  // * Сортировка по убыванию по официальной дате приказа
  validDateOrders = validDateOrders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let foundCurrentGroup = false;

  for (const order of validDateOrders) {
    if (order.id_group === idGroup) {
      foundCurrentGroup = true;
      continue;
    } else if (!foundCurrentGroup && order.id_group !== idGroup) {
      continue;
    } else {
      return order;
    }
  }

  return validDateOrders[0] || undefined;
}

export { parseFunding };
