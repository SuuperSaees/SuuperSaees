import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined in environment variables');
}

const stripe = new Stripe(stripeSecretKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const account = await stripe.accounts.create({
        type: 'standard',
      });

      res.status(200).json({ account });
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message;
      
      res.status(500).json({ error: errorMessage });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
