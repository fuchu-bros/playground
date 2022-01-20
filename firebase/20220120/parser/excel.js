const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const firestore = require('../src/firebase/firestore');

const __OLD_FILES__ = path.resolve(__dirname, '_old');
if ( fs.existsSync(__OLD_FILES__) === false ) {
    fs.mkdirSync(__OLD_FILES__);
}

const getDataFiles = fs.readdirSync(path.resolve(__dirname)).filter(name => /[a-z_0-9]*\.(pdf|xlsx)/.test(name));
console.log(getDataFiles);

exit();

const workbook = new ExcelJS.Workbook();

workbook.xlsx.readFile(__dirname + '\\shinhan.xlsx').then(r => {
    // console.log("File", r);
    
    r.eachSheet((worksheet, sheetId) => {
        // console.log(sheetId, worksheet);
        let rowData = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {

                const data = {
                    id: row.getCell(2).value,
                    date: row.getCell(1).value,
                    amount: row.getCell(7).value,
                    status: row.getCell(9).value
                };
                rowData.push(data);
            }
        })
        console.log(rowData);
    });
})