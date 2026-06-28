import {
  courseList,
  deductReasonList,
  educationFormList,
  financingList,
  genderList,
  levelCodeList,
  levelList,
  placesList,
  russiaDocumentTypeList,
} from './templateLists';

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
    name: 'Отчество на латинице (при наличии)',
    required: false,
  },
  {
    name: 'Пол получателя', // Муж/Жен
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: genderList.join(','),
    },
  },
  {
    name: 'Дата рождения получателя', // dd.mm.yyyy
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Место рождения',
    required: true,
  },
  {
    name: 'Тип документа РФ', // Паспорт гражданина Российской Федерации/Заграничный паспорт гражданина Российской Федерации
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: russiaDocumentTypeList.join(','),
    },
  },
  {
    name: 'Серия документа РФ',
    required: false,
  },
  {
    name: 'Номер документа РФ',
    required: false,
  },
  {
    name: 'Дата выдачи документа РФ', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'СНИЛС', // 000-000-000 00
    required: false,
    note: 'XXX-XXX-XXX XX',
  },
  {
    name: 'Тип документа, удостоверяющего личность иностранного гражданина (лица без гражданства)',
    required: false,
  },
  {
    name: 'Серия документа, удостоверяющего личность иностранного гражданина (лица без гражданства) (при наличии)',
    required: false,
  },
  {
    name: 'Номер документа, удостоверяющего личность иностранного гражданина (лица без гражданства)',
    required: false,
  },
  {
    name: 'Срок действия документа, удостоверяющего личность иностранного гражданина (лица без гражданства) (при наличии)', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Место выдачи документа, удостоверяющего личность иностранного гражданина (лица без гражданства) (при наличии)',
    required: false,
  },
  {
    name: 'Дата выдачи документа, удостоверяющего личность иностранного гражданина (лица без гражданства)', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Серия миграционной карты (для иностранного гражданина, лица без гражданства)',
    required: false,
  },
  {
    name: 'Номер миграционной карты (для иностранного гражданина, лица без гражданства)',
    required: false,
  },
  {
    name: 'Дата начала срока действия миграционной карты в РФ', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Дата окончания действия миграционной карты', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Гражданство (код страны по ОКСМ)', // Из списка
    required: true,
  },
  {
    name: 'Наименование уровня образования', // Из списка
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: levelList.join(','),
    },
  },
  {
    name: 'Код уровня образования', // Из списка, в соотв. с наименованием
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: levelCodeList.join(','),
    },
  },
  {
    name: 'Номер студенческого билета или иного документа, подтверждающего обучение',
    required: true,
  },
  {
    name: 'Дата выдачи студенческого билета или иного документа, подтверждающего обучение', // dd.mm.yyyy
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Номер курса', // 1-8
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: courseList.join(','),
    },
  },
  {
    name: 'Текущий год обучения', // 2026
    required: true,
    note: '2026',
  },
  {
    name: 'Наименование профессии, специальности, направления подготовки, по которой проводится обучение',
    required: true,
  },
  {
    name: 'Код (шифр) профессии, специальности, направления подготовки, по которой проводится обучение',
    required: true,
  },
  {
    name: 'Наименование образовательной программы, по которой проводится обучение',
    required: true,
  },
  {
    name: 'Код образовательной программы, по которой проводится обучение',
    required: false,
  },
  {
    name: 'Дата начала обучения по текущей образовательной программе', // dd.mm.yyyy
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Срок реализации образовательной программы (указать кол-во месяцев)',
    required: true,
  },
  {
    name: 'Форма обучения', // Очная/Очно-заочная (вечерняя)/Заочная
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: educationFormList.join(','),
    },
  },
  {
    name: 'Студенческая группа',
    required: true,
  },
  {
    name: 'Дата зачисления в образовательную или научную организацию', // dd.mm.yyyy
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Дата приказа о зачислении', // dd.mm.yyyy
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Номер приказа о зачислении',
    required: true,
  },
  {
    name: 'Срок обучения (в месяцах)',
    required: true,
  },
  {
    name: 'Источник финансирования обучения', // Из списка
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: financingList.join(','),
    },
  },
  {
    name: 'Вид мест', // Из списка
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: placesList.join(','),
    },
  },
  {
    name: 'Наличие первого высшего образования', // Да/Нет
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: 'Да,Нет',
    },
  },
  {
    name: 'Наличие стипендий или иных выплат', // Да/Нет
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: 'Да,Нет',
    },
  },
  {
    name: 'Наличие перевода/переводов', // Да/Нет
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: 'Да,Нет',
    },
  },
  {
    name: 'Наличие академа/академов (включая отпуск по уходу за ребенком)', // Да/Нет
    required: true,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: 'Да,Нет',
    },
  },
  {
    name: 'Планируемая дата окончания обучения в образовательной или научной организации по образовательной программе, по которой проводится обучение', // dd.mm.yyyy
    required: true,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Дата восстановления в образовательную или научную организацию', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Дата приказа о восстановлении', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Номер приказа о восстановлении',
    required: false,
  },
  {
    name: 'Дата завершения обучения или отчисления из образовательной или научной организации (при наличии)', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Дата приказа об отчислении или завершении обучения (при наличии)', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Номер приказа об отчислении (при наличии)',
    required: false,
  },
  {
    name: 'Причина отчисления', // Из списка
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: false,
      formulae: deductReasonList.join(','),
    },
  },
  {
    name: 'Выдача документа об образовании по окончании обучения', // Да/Нет
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: 'Да,Нет',
    },
  },
  {
    name: 'Дата начала обучения в военно-учебном центре', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Дата окончания обучения в военно-учебном центре', // dd.mm.yyyy
    required: false,
    note: 'дд.мм.гггг',
  },
  {
    name: 'Отправить в ГИР ВУ ', // Да или пустое поле
    required: false,
    dataValidation: {
      type: 'list',
      allowBlank: true,
      formulae: 'Да',
    },
  },
  {
    name: 'Внешний идентификатор студбилета',
    required: false,
  },
];
