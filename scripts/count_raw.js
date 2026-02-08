
const XLSX = require('xlsx');
const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

function countAll() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    console.log(`Total de linhas no Excel (contagem visual/física): ${range.e.r + 1}`);

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Array de dados length: ${data.length}`);
}

countAll();
