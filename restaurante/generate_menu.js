const XLSX = require('xlsx');

const data = [

];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Menu");
XLSX.writeFile(wb, "https://docs.google.com/spreadsheets/d/13B57Xr7FTrUdZ8nuy8ex4zWFv0F8Ve3zhpLXlt6-H5c/edit?usp=drive_link");
console.log("menu.xlsx created successfully!");
