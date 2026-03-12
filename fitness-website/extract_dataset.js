const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('datasets/gym recommendation.xlsx');
const sheet_name_list = workbook.SheetNames;
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

console.log('Columns:', Object.keys(data[0] || {}));
console.log('First 2 rows:', JSON.stringify(data.slice(0, 2), null, 2));

fs.writeFileSync('datasets/gym_recommendation.json', JSON.stringify(data, null, 2));
console.log('Total rows:', data.length);
console.log('Saved to JSON');
