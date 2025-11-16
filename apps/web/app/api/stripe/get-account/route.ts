import { NextRequest, NextResponse } from "next/server";


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
        const account = await stripe.accounts.retrieve(accountId)
        
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json(
            {error: {message: "Internal Server Error"}},
            {status: 500}
        )
    }
}