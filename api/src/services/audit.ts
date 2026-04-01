import { PrismaClient } from '@prisma/client';
import { captureException } from '@johnr1sh/lib/monitoring/sentry';

const prisma = new PrismaClient();

interface AuditEntry {
  userId?: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (err) {
    // Non-fatal: log to Sentry but don't break the request
    captureException(err, { context: 'audit.log', entry: entry as unknown as Record<string, unknown> });
  }
}
