import { NextApiRequest, NextApiResponse } from 'next';



import { POST } from './create';
import { DELETE } from './delete';
import { GET } from './get';


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('req.method', req.method);
  switch (req.method) {
    case 'POST':
      return POST(req, res);
    case 'GET':
      return GET(req, res);
    case 'DELETE':
      return DELETE(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}