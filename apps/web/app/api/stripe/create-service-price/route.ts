import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definición de tipos para los datos entrantes
interface PriceRequest {
    accountId: string;
    productId: string;
    unitAmount: number;
    currency: string;
    isRecurring: boolean;
    interval?: 'day' | 'week' | 'month' | 'year';
}

export async function POST(req: NextRequest) {
    const { accountId, productId, unitAmount, currency, isRecurring, interval }: PriceRequest = await req.json();

    try {
        const priceData: {
            product: string;
            unit_amount: number;
            currency: string;
            recurring?: {
                interval: 'day' | 'week' | 'month' | 'year';
            };
        } = {
            product: productId,
            unit_amount: unitAmount,
            currency: currency,
        };

        
         if (isRecurring && interval) {
                priceData.recurring = {
                    interval: interval,
                };
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const price = await stripe.prices.create(priceData, {
            stripeAccount: accountId, 
        });


        return NextResponse.json({ priceId: price.id });
    } catch (error) {
        console.error("Error creating price:", error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}
