import type { NextApiRequest, NextApiResponse } from 'next';
import { MODULE_REGISTRY, ORDERED_MODULES } from '../../../core/module-registry/registry';
import { apiSuccess } from '../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  return res.status(200).json(apiSuccess({ registry: MODULE_REGISTRY, ordered: ORDERED_MODULES }));
}
