import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';

const connection = jmuConnection;

async function getBasisLearning(idStudentGroup) {
  const orders = await connection('education.students_groups_orders as sgo')
    .select('o.id', 'o.name', 'o.date', 'to.name as order_type_name', 'to.id as order_type_id')
    .join('education.students_groups as sg', 'sg.id', 'sgo.id_students_groups')
    .join('education.orders as o', 'o.id', 'sgo.id_order')
    .join('education.type_orders as to', 'to.id', 'o.id_type_order')
    .where({ id_students_groups: idStudentGroup })
    .andWhere((builder) => {
      builder.whereIn('to.id', [1, 2, 3, 7, 12, 16]);
      // ! Для определения формы оплаты данный тип приказа следует игнорировать
      //.orWhere('to.id', TypeOrderEnum.Transfer);
    });
  // ! Сортировка по дате не сработает по причине неправильного формата для сортировки
  // .orderBy('sgo.id', 'DESC');

  // Преобразование даты
  let validDateOrders = orders.map((order) => {
    // * Формат даты в базе - DD.MM.YYYY
    const splittedDate = order.date.trim().split('.');
    return {
      ...order,
      date: new Date(`${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`),
    };
  });
  // * Сортировка по убыванию по официальной дате приказа
  validDateOrders = validDateOrders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return validDateOrders[0];
}

async function getStudentAndGroupInfo(idStudentGroup) {
  const studentAndGroupInfo = await connection('education.students as student')
    .select(
      'student.id as id_student',
      'student.firstname as student_firstname',
      'student.middlename as student_middlename',
      'student.lastname as student_lastname',
      'group.id as id_group',
      'group.nickname as group_nickname',
    )
    .innerJoin('education.students_groups as sg', 'sg.id_student', 'student.id')
    .innerJoin('education.study_groups as group', 'group.id', 'sg.id_group')
    .where('sg.id', idStudentGroup)
    .first();

  return studentAndGroupInfo;
}

async function getOrders(idStudent) {
  const orders = await connection('education.orders as orders')
    .select(
      'orders.id',
      'orders.name',
      'orders.date',
      'orders.id_type_order as order_type_id',
      'to.name as order_type_name',
      'sg.id_group',
    )
    .innerJoin('education.students_groups_orders as sgo', 'sgo.id_order', 'orders.id')
    .innerJoin('education.students_groups as sg', 'sg.id', 'sgo.id_students_groups')
    .innerJoin('education.type_orders as to', 'to.id', 'orders.id_type_order')
    .where('sg.id_student', idStudent)
    .andWhere((builder) => {
      builder.whereIn('to.id', [1, 2, 3, 7, 12, 16, 9]);
    });
  // ! Не нужная сортировка, так как сырой формат в базе не предназначен для сортировки
  // .orderBy([{ column: 'orders.date', order: 'desc' }]);

  return orders;
}

export { getBasisLearning, getOrders, getStudentAndGroupInfo };
