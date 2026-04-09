import { PrismaClient } from '../generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';

// Force IPv4 to avoid ETIMEDOUT on systems with unreachable IPv6
class IPv4WebSocket extends WebSocket {
  constructor(url: string, protocols?: string | string[]) {
    super(url, protocols, { family: 4 });
  }
}
neonConfig.webSocketConstructor = IPv4WebSocket;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
