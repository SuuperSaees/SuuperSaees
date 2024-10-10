import { NextApiRequest, NextApiResponse } from 'next';

import { createSubdomain } from './create';
import { deleteSubdomain } from './delete';
import { getSubdomain } from './get';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return createSubdomain(req, res);
    case 'GET':
      return getSubdomain(req, res);
    case 'DELETE':
      return deleteSubdomain(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
