
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

async function audit() {
    console.log("Iniciando Auditoria de Contagem...");

    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Contar linhas que parecem ter dados (ignorando header na linha 0)
    const excelItems = data.slice(1).filter(row => row[0] || row[1]);
    console.log(`Linhas totais no Excel (com dados): ${excelItems.length}`);

    const dbTotal = await prisma.item.count();
    console.log(`Total no Banco de Dados: ${dbTotal}`);

    if (excelItems.length !== dbTotal) {
        console.log("\nDetectada discrepância! Buscando item faltante...");

        const dbUrls = new Set((await prisma.item.findMany({ select: { gameUrl: true } })).map(i => i.gameUrl));

        let missing = [];
        excelItems.forEach((row, index) => {
            const url = row[1] ? row[1].toString().trim() : null;
            if (url && !dbUrls.has(url)) {
                missing.push({ line: index + 2, folder: row[0], url: url });
            }
        });

        if (missing.length > 0) {
            console.log("Itens no Excel que NÃO estão no banco:");
            missing.forEach(m => console.log(`- Linha ${m.line}: ${m.folder} (${m.url})`));
        } else {
            console.log("Todos os URLs do Excel estão no banco. A diferença pode ser uma linha duplicada ou vazia no Excel.");
        }
    } else {
        console.log("As contagens batem exatamente!");
    }
}

audit().finally(() => prisma.$disconnect());
