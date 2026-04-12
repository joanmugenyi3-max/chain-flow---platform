import type { NextApiRequest, NextApiResponse } from 'next';
import { updateTenantLanguage } from '../../../core/persistence/tenantStore';
import { apiSuccess } from '../../../lib/api';
import type { Locale } from '../../../i18n';

const VALID_LOCALES: Locale[] = ['en', 'fr'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).end();

  const tenantId = (req.query.tenantId as string) ||
    (req.headers['x-tenant-id'] as string) || 'demo';

  const { language } = req.body as { language: unknown };

  if (!language || !VALID_LOCALES.includes(language as Locale)) {
    return res.status(400).json({
      data: null,
      error: `Invalid language. Must be one of: ${VALID_LOCALES.join(', ')}`,
    });
  }

  const updated = updateTenantLanguage(tenantId, language as string);
  if (!updated) {
    return res.status(404).json({ data: null, error: 'Tenant not found' });
  }

  return res.status(200).json(apiSuccess({ tenantId, language }));
}
