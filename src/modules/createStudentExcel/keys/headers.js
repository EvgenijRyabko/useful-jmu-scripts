import {
  courseList,
  deductReasonList,
  educationFormList,
  financingList,
  genderList,
  levelCodeList,
  levelList,
  oksmList,
  placesList,
  russiaDocumentTypeList,
} from '../templateLists/index.js';

/**
 * @type {{
 *    position: number;
 *    name: string;
 *    required: boolean;
 *    dataValidation: import('exceljs').DataValidation;
 *    note?: string;
 *  }[]
 * }
 */
export const headers = [
  {
    position: 1,
    name: 'Фамилия получателя',
    required: true,
    note: 'как в документе удостоверяющем личность',
  },
  {
    position: 2,
    name: 'Имя получателя',
    required: true,
    note: 'как в документе удостоверяющем личность',
  },
  {
    position: 3,
    name: 'Отчество получателя',
    required: false,
    note: 'как в документе удостоверяющем личность',
  },
  {
    position: 4,
    name: 'Фамилия на латинице (при наличии)',
    required: false,
  },
  {
    position: 5,
    name: 'Имя на латинице (при наличии)',
    required: false,
  },
  {
    position: 6,
    name: 'Отчество на латинице (при наличии)',
    required: false,
  },
  {
    position: 7,
    name: 'Пол получателя',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${genderList.join(',')}"`],
    },
  },
  {
    position: 8,
    name: 'Дата рождения получателя',
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    position: 9,
    name: 'Место рождения',
    required: true,
  },
  {
    position: 10,
    name: 'Тип документа РФ',
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: [`"${russiaDocumentTypeList.join(',')}"`],
    },
  },
  {
    position: 11,
    name: 'Серия документа РФ',
    required: false,
  },
  {
    position: 12,
    name: 'Номер документа РФ',
    required: false,
  },
  {
    position: 13,
    name: 'Дата выдачи документа РФ',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 14,
    name: 'СНИЛС',
    required: false,
    note: 'XXX-XXX-XXX XX',
  },
  {
    position: 15,
    name: 'Тип документа, удостоверяющего личность иностранного гражданина (лица без гражданства)',
    required: false,
  },
  {
    position: 16,
    name: 'Серия документа, удостоверяющего личность иностранного гражданина (лица без гражданства) (при наличии)',
    required: false,
  },
  {
    position: 17,
    name: 'Номер документа, удостоверяющего личность иностранного гражданина (лица без гражданства)',
    required: false,
  },
  {
    position: 18,
    name: 'Срок действия документа, удостоверяющего личность иностранного гражданина (лица без гражданства) (при наличии)',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 19,
    name: 'Место выдачи документа, удостоверяющего личность иностранного гражданина (лица без гражданства) (при наличии)',
    required: false,
  },
  {
    position: 20,
    name: 'Дата выдачи документа, удостоверяющего личность иностранного гражданина (лица без гражданства)',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 21,
    name: 'Серия миграционной карты (для иностранного гражданина, лица без гражданства)',
    required: false,
  },
  {
    position: 22,
    name: 'Номер миграционной карты (для иностранного гражданина, лица без гражданства)',
    required: false,
  },
  {
    position: 23,
    name: 'Дата начала срока действия миграционной карты в РФ',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 24,
    name: 'Дата окончания действия миграционной карты',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 25,
    name: 'Гражданство (код страны по ОКСМ)',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: [`"${oksmList.join(',')}"`],
    },
  },
  {
    position: 26,
    name: 'Наименование уровня образования',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${levelList.join(',')}"`],
    },
  },
  {
    position: 27,
    name: 'Код уровня образования',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${levelCodeList.join(',')}"`],
    },
  },
  {
    position: 28,
    name: 'Номер студенческого билета или иного документа, подтверждающего обучение',
    required: true,
  },
  {
    position: 29,
    name: 'Дата выдачи студенческого билета или иного документа, подтверждающего обучение',
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    position: 30,
    name: 'Номер курса',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${courseList.join(',')}"`],
    },
  },
  {
    position: 31,
    name: 'Текущий год обучения',
    required: true,
    note: '2026',
  },
  {
    position: 32,
    name: 'Наименование профессии, специальности, направления подготовки, по которой проводится обучение',
    required: true,
  },
  {
    position: 33,
    name: 'Код (шифр) профессии, специальности, направления подготовки, по которой проводится обучение',
    required: true,
  },
  {
    position: 34,
    name: 'Наименование образовательной программы, по которой проводится обучение',
    required: true,
  },
  {
    position: 35,
    name: 'Код образовательной программы, по которой проводится обучение',
    required: false,
  },
  {
    position: 36,
    name: 'Дата начала обучения по текущей образовательной программе',
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    position: 37,
    name: 'Срок реализации образовательной программы (указать кол-во месяцев)',
    required: true,
  },
  {
    position: 38,
    name: 'Форма обучения',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${educationFormList.join(',')}"`],
    },
  },
  {
    position: 39,
    name: 'Студенческая группа',
    required: true,
  },
  {
    position: 40,
    name: 'Дата зачисления в образовательную или научную организацию',
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    position: 41,
    name: 'Дата приказа о зачислении',
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    position: 42,
    name: 'Номер приказа о зачислении',
    required: true,
  },
  {
    position: 43,
    name: 'Срок обучения (в месяцах)',
    required: true,
  },
  {
    position: 44,
    name: 'Источник финансирования обучения',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${financingList.join(',')}"`],
    },
  },
  {
    position: 45,
    name: 'Вид мест',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: [`"${placesList.join(',')}"`],
    },
  },
  {
    position: 46,
    name: 'Наличие первого высшего образования',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: ['"Да,Нет"'],
    },
  },
  {
    position: 47,
    name: 'Наличие стипендий или иных выплат',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: ['"Да,Нет"'],
    },
  },
  {
    position: 48,
    name: 'Наличие перевода/переводов',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: ['"Да,Нет"'],
    },
  },
  {
    position: 49,
    name: 'Наличие академа/академов (включая отпуск по уходу за ребенком)',
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: ['"Да,Нет"'],
    },
  },
  {
    position: 50,
    name: 'Планируемая дата окончания обучения в образовательной или научной организации по образовательной программе, по которой проводится обучение',
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    position: 51,
    name: 'Дата восстановления в образовательную или научную организацию',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 52,
    name: 'Дата приказа о восстановлении',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 53,
    name: 'Номер приказа о восстановлении',
    required: false,
  },
  {
    position: 54,
    name: 'Дата завершения обучения или отчисления из образовательной или научной организации (при наличии)',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 55,
    name: 'Дата приказа об отчислении или завершении обучения (при наличии)',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 56,
    name: 'Номер приказа об отчислении (при наличии)',
    required: false,
  },
  {
    position: 57,
    name: 'Причина отчисления',
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: deductReasonList.join(','),
    },
  },
  {
    position: 58,
    name: 'Выдача документа об образовании по окончании обучения',
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: ['"Да,Нет"'],
    },
  },
  {
    position: 59,
    name: 'Дата начала обучения в военно-учебном центре',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 60,
    name: 'Дата окончания обучения в военно-учебном центре',
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    position: 61,
    name: 'Отправить в ГИР ВУ ',
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: ['"Да"'],
    },
  },
  {
    position: 62,
    name: 'Внешний идентификатор студбилета',
    required: false,
  },
];
