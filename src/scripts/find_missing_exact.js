
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

async function findMissing() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const dbUrls = new Set((await prisma.item.findMany({ select: { gameUrl: true } })).map(i => i.gameUrl));

    console.log(`Excel URLs: ${data.length}`);
    console.log(`DB URLs: ${dbUrls.size}`);

    let missing = [];
    data.forEach((row, index) => {
        const url = row[1] ? row[1].toString().trim() : null;
        if (url && !dbUrls.has(url)) {
            missing.push({ line: index + 1, folder: row[0], url: url });
        }
    });

    if (missing.length > 0) {
        console.log("\nITENS NO EXCEL QUE NUNCA FORAM IMPORTADOS:");
        missing.forEach(m => console.log(`Linha ${m.line}: ${m.folder}`));
    } else {
        console.log("\nTodos os URLs do Excel estao no banco.");

        // Se nao tem URL faltando, talvez o Excel tenha uma linha duplicada?
        const excelUrls = data.map(r => r[1] ? r[1].toString().trim() : null).filter(Boolean);
        const uniqueExcelUrls = new Set(excelUrls);
        console.log(`Unique URLs in Excel: ${uniqueExcelUrls.size}`);

        if (excelUrls.length !== uniqueExcelUrls.size) {
            console.log("Detectamos URLs DUPLICADOS no Excel!");
            const counts = {};
            excelUrls.forEach(u => counts[u] = (counts[u] || 0) + 1);
            Object.keys(counts).filter(u => counts[u] > 1).forEach(u => {
                console.log(`URL Duplicado: ${u} (aparece ${counts[u]} vezes)`);
            });
        }
    }
}

findMissing().finally(() => prisma.$disconnect());
