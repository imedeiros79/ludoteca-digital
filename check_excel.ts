
import * as XLSX from 'xlsx';

const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

function main() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Excel Headers/First Rows:', JSON.stringify(data.slice(0, 3), null, 2));
}

main();
