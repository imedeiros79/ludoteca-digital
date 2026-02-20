
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
const streamToString = (stream: any): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
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
        const command: ListObjectsV2Command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: PREFIX,
            Delimiter: '/',
            ContinuationToken: continuationToken
        });

        const response = await s3.send(command);

        // CommonPrefixes contém as "pastas"
        if (response.CommonPrefixes) {
            response.CommonPrefixes.forEach((prefix: any) => {
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
            const hasIndex = contents.some((obj: any) => obj.Key?.endsWith('index.html'));
            if (!hasIndex) return; // Pula se não for jogo

            // Achar imagem
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.PNG', '.JPG', '.JPEG'];

            // Tenta achar 'thumbnail' ou 'capa' primeiro (com variações de caixa)
            let imageKey = contents.find((obj: any) =>
                obj.Key && imageExtensions.some((ext: string) => obj.Key!.toLowerCase().endsWith(ext.toLowerCase())) &&
                (obj.Key!.toLowerCase().includes('thumbnail') || obj.Key!.toLowerCase().includes('capa'))
            )?.Key;

            // Em último caso busca ícone do appmanifest ou qualquer imagem na raiz
            if (!imageKey) {
                imageKey = contents.find((obj: any) => obj.Key?.toLowerCase().includes('icons/icon-512.png'))?.Key;
            }

            if (!imageKey) {
                imageKey = contents.find((obj: any) => {
                    if (!obj.Key) return false;
                    const relative = obj.Key.replace(prefix, '');
                    const isRootFile = !relative.includes('/');
                    return isRootFile && imageExtensions.some((ext: string) => obj.Key!.toLowerCase().endsWith(ext.toLowerCase()));
                })?.Key;
            }

            // Tentar extrair metadados do info.txt
            let title = folder.replace(/_/g, ' ');
            let description = 'Recuperado do S3';
            let subject = 'Geral';
            let year = 'Geral';

            const infoFile = contents.find((obj: any) => obj.Key?.toLowerCase().endsWith('info.txt'));
            if (infoFile && infoFile.Key) {
                try {
                    const getInfoCmd = new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: infoFile.Key
                    });
                    const infoRes = await s3.send(getInfoCmd);
                    const infoContent = await streamToString(infoRes.Body);

                    const nameMatch = infoContent.match(/Nome:\s*(.+)/i);
                    const subjectMatch = infoContent.match(/Componente\/Campo de experiência:\s*(.+)/i);
                    const stageMatch = infoContent.match(/Etapa Letiva:\s*(.+)/i);

                    if (nameMatch) title = nameMatch[1].trim();
                    if (subjectMatch) subject = subjectMatch[1].trim();
                    if (stageMatch) year = stageMatch[1].trim();
                    description = infoContent.substring(0, 500); // Primeiros 500 caracteres como descrição
                } catch (e) {
                    console.error(`Erro ao ler info.txt de ${folder}:`, e);
                }
            }

            const gameUrl = `${CLOUDFRONT_BASE}/todas/${folder}/index.html`;
            const imageUrl = imageKey ? `${CLOUDFRONT_BASE}/${imageKey}` : null;

            validGameUrls.push(gameUrl);

            // Tenta buscar item existente pela URL
            const existing = await prisma.item.findFirst({
                where: { gameUrl: gameUrl }
            });

            if (existing) {
                // Atualizar se houver mudanças significativas
                if (imageUrl && (existing.imageUrl !== imageUrl || existing.title === folder.replace(/_/g, ' '))) {
                    await prisma.item.update({
                        where: { id: existing.id },
                        data: {
                            imageUrl: imageUrl,
                            title: title,
                            subject: subject,
                            year: year,
                            description: description
                        }
                    });
                    updated++;
                }
            } else {
                // Criar novo se não existe
                await prisma.item.create({
                    data: {
                        title: title,
                        gameUrl: gameUrl,
                        imageUrl: imageUrl,
                        description: description,
                        subject: subject,
                        year: year
                    }
                });
                console.log(`➕ Novo jogo encontrado e adicionado com sucesso: ${title}`);
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
