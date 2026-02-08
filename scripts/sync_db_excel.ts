
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();
const EXCEL_PATH = 'D:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

async function main() {
    console.log('📊 Iniciando Sincronização com Excel (Fonte da Verdade)...');

    // 1. Ler Excel
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Ler como array de arrays
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Extrair lista de nomes de pasta permitidos
    const allowedFolders = new Set<string>();

    rows.forEach(row => {
        if (row[0]) {
            const folderName = row[0].toString().trim();
            allowedFolders.add(folderName);
        }
    });

    console.log(`✅ Total de jogos na lista oficial (Excel): ${allowedFolders.size}`);

    // 2. Buscar todos os jogos do banco
    const allItems = await prisma.item.findMany({
        select: { id: true, gameUrl: true, title: true }
    });

    console.log(`📦 Total de jogos no banco atualmente: ${allItems.length}`);

    // 3. Filtrar jogos a serem mantidos e removidos
    let keptCount = 0;
    let deletedCount = 0;

    for (const item of allItems) {
        const match = item.gameUrl.match(/\/todas\/([^\/]+)\/index\.html/);

        let shouldKeep = false;
        if (match && match[1]) {
            const folderName = match[1];
            if (allowedFolders.has(folderName)) {
                shouldKeep = true;
            }
        }

        if (shouldKeep) {
            keptCount++;
        } else {
            // Uncomment to delete
            // await prisma.item.delete({ where: { id: item.id } });
            // deletedCount++;
        }
    }

    console.log(`\n--- RESUMO FINAL ---`);
    console.log(`Jogos Mantidos (Analise): ${keptCount}`);

    // Verificação de Integridade e Listagem de Faltantes
    console.log(`\n--- RELATÓRIO DE DISCREPÂNCIAS ---`);

    const currentFoldersSet = new Set<string>();

    allItems.forEach(item => {
        const match = item.gameUrl.match(/\/todas\/([^\/]+)\/index\.html/);
        if (match && allowedFolders.has(match[1])) {
            currentFoldersSet.add(match[1]);
        }
    });

    // Achar os que estão no Excel mas NÃO no set atual
    const missing = [...allowedFolders].filter(f => !currentFoldersSet.has(f));

    if (missing.length > 0) {
        console.log(`🚨 Faltam ${missing.length} jogos que estão no Excel mas NÃO no Banco.`);
        fs.writeFileSync('missing_games.json', JSON.stringify(missing, null, 2));
        console.log('Lista salva em missing_games.json');
    } else {
        console.log(`✅ Todos os jogos do Excel estão presentes!`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
