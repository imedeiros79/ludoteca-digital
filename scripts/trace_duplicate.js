
const XLSX = require('xlsx');
const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

function findLines() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const target = "https://dmrafr2igetxh.cloudfront.net/todas/tres_lobinhos_e_o_porco_mau_6019/index.html";

    console.log(`Buscando duplicatas para: ${target}\n`);
    data.forEach((row, index) => {
        if (row[1] && row[1].toString().trim() === target) {
            console.log(`Encontrado na Linha ${index + 1}: ${row[0]}`);
        }
    });
}

findLines();
