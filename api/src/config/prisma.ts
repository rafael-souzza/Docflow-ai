const { PrismaClient } = require('../generated/prisma');
const prisma = new (PrismaClient as any)();
export default prisma;
