
const XLSX = require('xlsx');
const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

function debug() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("Linha 1 (index 0):", JSON.stringify(data[0]));
    console.log("Linha 2 (index 1):", JSON.stringify(data[1]));
}

debug();
