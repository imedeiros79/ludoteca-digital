
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = 'D:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON to see headers
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Headers:', data[0]);
    console.log('First row:', data[1]);
    console.log('Total rows:', data.length);

} catch (error) {
    console.error('Error reading excel:', error);
}
