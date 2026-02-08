
import { PrismaClient } from '@prisma/client';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuração AWS (Hardcoded por enquanto conforme fornecido)
const S3_CONFIG = {
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
};

const BUCKET_NAME = 'minas-educa-games-br';
const CLOUDFRONT_BASE = 'https://dmrafr2igetxh.cloudfront.net';
const PREFIX = 'todas/';

const prisma = new PrismaClient();
const s3 = new S3Client(S3_CONFIG);

// Função auxiliar para ler stream do S3 (caso precisemos do info.txt no futuro)
const streamToString = (stream: any) =>
    new Promise<string>((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

async function main() {
    console.log('🔄 Iniciando Sincronização Total com S3...');

    // 1. Listar todas as "pastas" (Prefixos comuns) em 'todas/'
    // O S3 não tem pastas reais, mas usando Delimiter '/' ele simula.

    let continuationToken: string | undefined = undefined;
    const s3Folders: string[] = [];

    do {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: PREFIX,
            Delimiter: '/',
            ContinuationToken: continuationToken
        });

        const response = await s3.send(command);

        // CommonPrefixes contém as "pastas"
        if (response.CommonPrefixes) {
            response.CommonPrefixes.forEach(prefix => {
                if (prefix.Prefix) {
                    // Remover 'todas/' do início e '/' do final para pegar o nome da pasta
                    const folderName = prefix.Prefix.replace('todas/', '').replace('/', '');
                    if (folderName) s3Folders.push(folderName);
                }
            });
        }

        continuationToken = response.NextContinuationToken;
        process.stdout.write('.');
    } while (continuationToken);

    console.log(`\n📦 Total de pastas encontradas no S3: ${s3Folders.length}`);

    // 2. Para cada pasta, vamos varrer o conteúdo para achar a imagem e confirmar index.html
    let processed = 0;
    let updated = 0;
    const validGameUrls: string[] = [];

    // Processar em lotes para não estourar memória/tempo
    const CHUNK_SIZE = 50;
    for (let i = 0; i < s3Folders.length; i += CHUNK_SIZE) {
        const chunk = s3Folders.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(async (folder) => {
            // FILTER: Ignore 'Fabrica' or 'fabrica'
            if (folder.toLowerCase().startsWith('fabrica')) {
                // console.log(`Ignorando: ${folder}`); 
                return;
            }

            const prefix = `todas/${folder}/`;

            // Listar conteúdo da pasta
            const listCmd = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix
            });

            const listRes = await s3.send(listCmd);
            const contents = listRes.Contents || [];

            // Verificar se tem index.html (é um jogo válido)
            const hasIndex = contents.some(obj => obj.Key?.endsWith('index.html'));
            if (!hasIndex) return; // Pula se não for jogo

            // Achar imagem
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

            // Tenta achar 'thumbnail' ou 'capa' primeiro
            let imageKey = contents.find(obj =>
                obj.Key && imageExtensions.some(ext => obj.Key!.toLowerCase().endsWith(ext)) &&
                (obj.Key!.toLowerCase().includes('thumbnail') || obj.Key!.toLowerCase().includes('capa'))
            )?.Key;

            // Se não, pega qualquer imagem na raiz da pasta
            if (!imageKey) {
                imageKey = contents.find(obj => {
                    if (!obj.Key) return false;
                    const relative = obj.Key.replace(prefix, '');
                    const isRootFile = !relative.includes('/');
                    return isRootFile && imageExtensions.some(ext => obj.Key!.toLowerCase().endsWith(ext));
                })?.Key;
            }

            const gameUrl = `${CLOUDFRONT_BASE}/todas/${folder}/index.html`;
            const imageUrl = imageKey ? `${CLOUDFRONT_BASE}/${imageKey}` : null;

            validGameUrls.push(gameUrl);

            // Upsert no Banco
            // Vamos tentar achar pelo gameUrl (único) ou title (se extrairmos do info.txt)
            // Por simplificação, vamos assumir que o título é o nome da pasta formatado se não existir,
            // mas idealmente atualizamos o item existente que bata com a URL.

            // Tenta buscar item existente pela URL (mais seguro que ID)
            const existing = await prisma.item.findFirst({
                where: { gameUrl: gameUrl }
            });

            if (existing) {
                if (imageUrl && existing.imageUrl !== imageUrl) {
                    await prisma.item.update({
                        where: { id: existing.id },
                        data: { imageUrl: imageUrl }
                    });
                    updated++;
                }
            } else {
                // Criar novo se não existe (Recuperação total)
                await prisma.item.create({
                    data: {
                        title: folder.replace(/_/g, ' '), // Nome provisório
                        gameUrl: gameUrl,
                        imageUrl: imageUrl,
                        description: 'Recuperado do S3',
                        subject: 'Geral',
                        year: 'Geral'
                    }
                });
                console.log(`➕ Novo jogo encontrado e adicionado: ${folder}`);
            }
        }));

        processed += chunk.length;
        process.stdout.write(`\rProcessados: ${processed}/${s3Folders.length}`);
    }

    console.log('\n\n🧹 Limpando jogos fantasmas do Banco de Dados...');

    // 3. Remover jogos do banco que NÃO estão na lista validGameUrls
    const deleteResult = await prisma.item.deleteMany({
        where: {
            gameUrl: {
                notIn: validGameUrls
            }
        }
    });

    console.log(`❌ Jogos removidos (não existem no S3): ${deleteResult.count}`);
    console.log('✅ Sincronização Concluída!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
