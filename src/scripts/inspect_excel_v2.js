
const XLSX = require('xlsx');
const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

function inspect() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("--- Primeiras 5 linhas do Excel ---");
    data.slice(0, 5).forEach((row, i) => {
        console.log(`Linha ${i + 1}:`, row);
    });

    console.log("\n--- Últimas 2 linhas do Excel ---");
    console.log(`Linha ${data.length - 1}:`, data[data.length - 2]);
    console.log(`Linha ${data.length}:`, data[data.length - 1]);
}

inspect();
