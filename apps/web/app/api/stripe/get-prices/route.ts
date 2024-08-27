import { NextRequest, NextResponse } from "next/server";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  // Obtiene el `accountId` de la consulta
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  console.log('Account ID:', accountId);

  if (!accountId) {
      return NextResponse.json(
          { error: { message: "Account ID is required" } },
          { status: 400 }
      );
  }

  try {
      // Recupera los productos de la cuenta conectada
      const products = await stripe.prices.list({
          limit: 100, 
      }, {
          stripeAccount: accountId, 
      });

      console.log('Prices:', products);

      return NextResponse.json(products);
  } catch (error) {
      console.error('Error retrieving products:', error);
      return NextResponse.json(
          { error: { message: "Internal Server Error" } },
          { status: 500 }
      );
  }
}
