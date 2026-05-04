import { PrismaClient } from './src/generated/prisma';
const p = new (PrismaClient as any)();
console.log('✅ Instanciado!');
p.$connect().then(() => {
  console.log('✅ Conectado ao banco!');
  p.$disconnect();
}).catch((e: any) => {
  console.error('❌', e.message);
});
