const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const {addRawData} = require('../src/firebase/firestore');

const __OLD_FILES__ = path.resolve(__dirname, '_old');
if ( fs.existsSync(__OLD_FILES__) === false ) {
    fs.mkdirSync(__OLD_FILES__);
}

const getDataFiles = fs.readdirSync(path.resolve(__dirname)).filter(name => /^[a-z_0-9]*\.(xlsx)$/.test(name));

const makeShinhanData = (sheetData) => {
    let result = [];
    sheetData.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            result.push({
                service: 'shinhan',
                id: row.getCell(2).value,
                date: row.getCell(1).value.split(/\s+/).shift().replace(/\//g, '.'),
                amount: row.getCell(7).value,
                status: billStatus,
                name: row.getCell(6).value,
                tags: [],
                user: 'heono'
            });
        }
    });
    
    return result;
}
const makeSamsungData = (sheetData) => {
    let result = [];
    sheetData.eachRow((row, rowNumber) => {
        if (rowNumber > 9) {
            if (row.getCell(10).value == '취소') {
                // 취소건 찾아서 제거
                result.filter(r => r.id !== row.getCell(9).value);
            } else {
                // 추가
                result.push({
                    service: 'samsung',
                    id: row.getCell(9).value,
                    date: row.getCell(3).value,
                    amount: row.getCell(6).value,
                    name: row.getCell(5).value,
                    tags: [],
                    user: 'ozworks'
                });
            }
        }
    });
    return result;
}

(async () => {
    let stackData = [];
    for (const filename of getDataFiles) {
        const filepath = path.resolve(__dirname, filename);
        if (fs.existsSync(filepath)) {
            const [serviceName, stackDate] = filename.split('.').shift().split('_');
            let workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filepath);

            workbook.eachSheet((sheetData, sheetId) => {
                switch(serviceName) {
                    case 'samsung':
                        stackData = stackData.concat(makeSamsungData(sheetData));
                        break;
                    case 'shinhan':
                        stackData = stackData.concat(makeShinhanData(sheetData));
                        break;
                }
            })
                
        }
    }
    
    console.log("ROW DATA", stackData);
})()

const saveRawData = (data) => {
    if (loopCounter === getDataFiles.length) {
        // 저장
    }
};