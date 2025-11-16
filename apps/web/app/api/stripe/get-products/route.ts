import { NextRequest, NextResponse } from "next/server";
import { StripeProductResponse } from "~/services/hooks/use-stripe";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  // Obtiene el `accountId` de la consulta
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  if (!accountId) {
      return NextResponse.json(
          { error: { message: "Account ID is required" } },
          { status: 400 }
      );
  }

  try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const products = await stripe.products.list({
          limit: 100, 
      }, {
          stripeAccount: accountId, 
      }) as StripeProductResponse;

      return NextResponse.json(products);
  } catch (error) {
      console.error('Error retrieving products:', error);
      return NextResponse.json(
          { error: { message: "Internal Server Error" } },
          { status: 500 }
      );
  }
}
