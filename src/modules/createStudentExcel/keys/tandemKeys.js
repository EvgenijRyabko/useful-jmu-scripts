/**
 * @typedef {Object} HeaderItem
 * @property {number} [position]
 * @property {string} name
 * @property {boolean} required
 * @property {'Персоны' | 'Обучающиеся'} listName
 */

/**
 * @typedef {
 *  'fio'
 *  | 'gender'
 *  | 'birthday'
 *  | 'birthPlace'
 *  | 'series'
 *  | 'number'
 *  | 'issuedDate'
 *  | 'snils'
 *  | 'recordBook'
 *  | 'course'
 *  | 'eduSpecialty'
 *  | 'eduProfile'
 *  | 'qualification'
 *  | 'studyForm'
 *  | 'enrollOrderDate'
 * } StudentFieldKey
 */

/**
 * @type {Record<StudentFieldKey, HeaderItem>}
 */
export const tandemDataKeys = {
  fio: {
    name: 'ФИО',
    required: true,
    listName: 'Персоны',
  },
  gender: {
    name: 'Пол',
    required: true,
    listName: 'Персоны',
  },
  birthday: {
    name: 'Дата рождения',
    required: true,
    listName: 'Персоны',
  },
  birthPlace: {
    name: 'Место рождения',
    required: true,
    listName: 'Персоны',
  },
  documentType: {
    name: 'Тип УЛ',
    required: true,
    listName: 'Персоны',
  },
  series: {
    name: 'Серия УЛ',
    required: true,
    listName: 'Персоны',
  },
  number: {
    name: 'Номер УЛ',
    required: true,
    listName: 'Персоны',
  },
  issuedDate: {
    name: 'Дата выдачи УЛ',
    required: true,
    listName: 'Персоны',
  },
  documentValid: {
    name: 'Срок действия УЛ',
    required: false,
    listName: 'Персоны',
  },
  issued: {
    name: 'Кем выдано УЛ',
    required: false,
    listName: 'Персоны',
  },
  snils: {
    name: 'СНИЛС',
    required: true,
    listName: 'Персоны',
  },
  qualification: {
    name: 'Перечень',
    required: true,
    listName: 'Обучающиеся',
  },
  recordBook: {
    name: 'Зачетная книжка',
    required: true,
    listName: 'Обучающиеся',
  },
  enrollDate: {
    name: 'Дата зачисления',
    required: true,
    listName: 'Обучающиеся',
  },
  course: {
    name: 'Курс',
    required: true,
    listName: 'Обучающиеся',
  },
  eduSpecialty: {
    name: 'Направление подготовки (специальность)',
    required: true,
    listName: 'Обучающиеся',
  },
  eduProfile: {
    name: 'Направленность',
    required: true,
    listName: 'Обучающиеся',
  },
  enrollOrder: {
    name: 'Номер приказа о зачислении',
    required: true,
    listName: 'Обучающиеся',
  },
  enrollOrderDate: {
    name: 'Дата приказа о зачислении',
    required: true,
    listName: 'Обучающиеся',
  },
  studyPeriod: {
    name: 'Нормативный срок',
    required: true,
    listName: 'Обучающиеся',
  },
  studyForm: {
    name: 'Форма освоения',
    required: true,
    listName: 'Обучающиеся',
  },
  group: {
    name: 'Группа',
    required: true,
    listName: 'Обучающиеся',
  },
  learningType: {
    name: 'Вид затрат',
    required: true,
    listName: 'Обучающиеся',
  },
  financing: {
    name: 'Уровень бюджетного финансирования',
    required: true,
    listName: 'Обучающиеся',
  },
  deductDate: {
    name: 'Дата приказа об отчислении',
    required: true,
    listName: 'Обучающиеся',
  },
  graduationDate: {
    name: 'Дата приказа о выпуске',
    required: true,
    listName: 'Обучающиеся',
  },
};
