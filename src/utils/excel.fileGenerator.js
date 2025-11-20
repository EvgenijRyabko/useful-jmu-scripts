import xlsx from 'exceljs';
import { access } from 'fs/promises';

export class ExcelTable {
  tableName;
  workBook = new xlsx.Workbook();
  /**
   * @type {{ [key: string]: xlsx.Worksheet }}
   */
  sheets = {};

  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   *
   * @param {string} name
   * @returns {xlsx.Worksheet}
   */
  createSheet(name) {
    this.sheets[name] = this.workBook.addWorksheet(name);

    return this.sheets[name];
  }

  /**
   * Здесь можно передать либо первый элемент данных, чтобы оно динамически создало хэдеры
   * Либо передать сам массив строк.
   * @param {string[] | object} headers
   */
  fillSimpleHeaders(headers, sheetName, style = {}, rowIndex = 1, colIndex = 1) {
    let pHeaders;
    const sheet = this.sheets[sheetName];

    if (headers instanceof Array) {
      pHeaders = headers;
    } else if (headers instanceof Object) {
      const objectKeys = Object.keys(headers);

      pHeaders = objectKeys;
    }

    const row = sheet.getRow(rowIndex);

    for (const header of pHeaders) {
      sheet.getColumn(colIndex).width = 25;

      const cell = row.getCell(colIndex);

      cell.value = header;
      cell.style = style;
      colIndex++;
    }

    return pHeaders;
  }

  fillTableData(data, headers, sheetName, rowIndex = 2) {
    const sheet = this.sheets[sheetName];

    for (const el of data) {
      const row = sheet.getRow(rowIndex);

      for (const header of headers) {
        const keyIndex = headers.findIndex((el) => el.label === header);

        const cell = row.getCell(keyIndex + 1);

        cell.value = el[header];
      }
      rowIndex++;
    }
  }

  async saveTable(path) {
    try {
      await access(path);

      await this.workBook.xlsx.writeFile(`${path}/${this.tableName}.xlsx`);
    } catch (error) {
      console.error(error?.message || error);
    }
  }
}
