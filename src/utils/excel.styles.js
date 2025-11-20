/**
 * @type {import('exceljs').Style}
 */
export const defaultCell = {
  alignment: {
    wrapText: true,
    vertical: 'middle',
    horizontal: 'center',
    indent: 1,
    readingOrder: 'ltr',
    shrinkToFit: false,
  },
  border: {
    top: {
      style: 'thin',
      color: { argb: '000000' },
    },
    bottom: {
      style: 'thin',
      color: { argb: '000000' },
    },
    left: {
      style: 'thin',
      color: { argb: '000000' },
    },
    right: {
      style: 'thin',
      color: { argb: '000000' },
    },
  },
};

/**
 * @type {import('exceljs').Style}
 */
export const headerStyle = {
  ...defaultCell,
  font: {
    bold: true,
    color: { argb: 'FFFFFFFF' },
  },
  fill: {
    pattern: 'solid',
    type: 'pattern',
    fgColor: { argb: '7d7d7d' },
  },
};

/**
 * @type {import('exceljs').Style}
 */
export const rowTitleStyle = {
  ...defaultCell,
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDEDED' } },
};

/**
 * @type {import('exceljs').Style}
 */
export const warningCell = {
  ...defaultCell,
  font: {
    bold: true,
    color: { argb: 'FFFFFFFF' },
  },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffc800' } },
};

/**
 * @type {import('exceljs').Style}
 */
export const dangerCell = {
  ...defaultCell,
  font: {
    bold: true,
    color: { argb: 'FFFFFFFF' },
  },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff0000' } },
};
