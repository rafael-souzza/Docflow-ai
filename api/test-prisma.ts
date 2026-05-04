import { PrismaClient } from './src/generated/prisma';
const p = new PrismaClient({ datasourceUrl: 'postgresql://postgres:postgres@localhost:5432/docflow?schema=public' });
p.$connect().then(() => { console.log('✅ Conectado!'); p.$disconnect(); }).catch((e: any) => console.error('❌', e.message));
