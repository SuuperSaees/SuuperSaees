import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  // Obtiene el `accountId` de la consulta
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId') as string;

  if (!customerId) {
      return NextResponse.json(
          { error: { message: "Subscription ID is required" } },
          { status: 400 }
      );
  }

  try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active"
      });
      return NextResponse.json(subscriptions.data);
  } catch (error) {
      console.error('Error retrieving subscriptions:', error);
      return NextResponse.json(
          { error: { message: "Internal Server Error" } },
          { status: 500 }
      );
  }
}
