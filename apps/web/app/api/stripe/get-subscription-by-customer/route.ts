import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  // Obtiene el `accountId` de la consulta
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
      return NextResponse.json(
          { error: { message: "Subscription ID is required" } },
          { status: 400 }
      );
  }

  try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const subscriptions = await stripe.subscriptions.retrieve(customerId);
    console.log(subscriptions, "SUBSCRIPTIONS FOUND")
      return NextResponse.json(subscriptions);
  } catch (error) {
      console.error('Error retrieving products:', error);
      return NextResponse.json(
          { error: { message: "Internal Server Error" } },
          { status: 500 }
      );
  }
}
