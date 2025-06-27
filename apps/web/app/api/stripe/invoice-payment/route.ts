import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      invoiceId,
      stripeInvoiceId,
      email,
      accountId,
      paymentMethodId,
      couponId,
      sessionId,
    } = await request.clone().json();

    const supabase = getSupabaseServerComponentClient(
      { admin: true },
    );

    // Verificar que la invoice existe en nuestra base de datos
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError ?? !invoice) {
      return NextResponse.json(
        { error: { message: 'Invoice not found' } },
        { status: 404 },
      );
    }

    // Verificar que la invoice tiene un provider_id válido
    if (!invoice.provider_id || invoice.provider_id.trim() === '') {
      return NextResponse.json(
        { error: { message: 'Invoice has no Stripe provider_id' } },
        { status: 400 },
      );
    }

    let customer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const existingCustomers = await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: accountId },
    );

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      customer = await stripe.customers.create(
        { email },
        { stripeAccount: accountId },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customer.id },
      { stripeAccount: accountId },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await stripe.customers.update(
      customer.id,
      {
        invoice_settings: { default_payment_method: paymentMethodId },
      },
      { stripeAccount: accountId },
    );

    // Obtener la invoice de Stripe
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const stripeInvoice = await stripe.invoices.retrieve(
      stripeInvoiceId,
      { stripeAccount: accountId }
    );

    if (!stripeInvoice) {
      return NextResponse.json(
        { error: { message: 'Stripe invoice not found' } },
        { status: 404 },
      );
    }

    let finalAmount = stripeInvoice.total;

    // Aplicar descuento si se proporciona
    if (couponId) {
      try {
        let discountDetails;

        // Determine if the code format matches a promotion code or coupon
        const isPromotionCodeFormat = /^[A-Za-z0-9]{8,}$/.test(couponId);
        
        if (isPromotionCodeFormat) {
          // Try promotion code first
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const promotionCodes = await stripe.promotionCodes.list({
            limit: 100,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            code: couponId.toUpperCase(),
          }, {
            stripeAccount: accountId,
          });

          if (promotionCodes.data.length > 0) {
            discountDetails = promotionCodes.data[0].coupon;
          }
        }

        // If not found as promotion code or format doesn't match, try as coupon
        if (!discountDetails) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          discountDetails = await stripe.coupons.retrieve(couponId, {
            stripeAccount: accountId,
          });
        }

        if (discountDetails.valid) {
          if (discountDetails.amount_off) {
            finalAmount = stripeInvoice.total - discountDetails.amount_off;
          } else if (discountDetails.percent_off) {
            finalAmount = stripeInvoice.total - Math.round((stripeInvoice.total * discountDetails.percent_off) / 100);
          }
        }
      } catch (error) {
        console.error('Error retrieving discount:', error);
        return NextResponse.json(
          { error: { message: 'Invalid or expired discount code' } },
          { status: 400 },
        );
      }
    }

    finalAmount = Math.max(finalAmount, 0);

    // Crear payment intent para pagar la invoice
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const paymentIntent = await stripe.paymentIntents.create(
      {
        customer: customer.id,
        amount: finalAmount,
        currency: stripeInvoice.currency,
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: { 
          sessionId: sessionId,
          invoiceId: invoiceId,
          stripeInvoiceId: stripeInvoiceId,
        },
      },
      { stripeAccount: accountId },
    );

    // Actualizar la invoice en nuestra base de datos si el pago fue exitoso
    if (paymentIntent.status === 'succeeded') {
      // Actualizar status de la invoice a 'paid'
      await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      // Crear registro de pago
      await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: invoiceId,
          payment_method: 'stripe',
          amount: finalAmount / 100, // Convertir de centavos a unidades
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          currency: stripeInvoice.currency.toUpperCase(),
          status: 'succeeded',
          provider_payment_id: paymentIntent.id,
          processed_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      payment_url: stripeInvoice.hosted_invoice_url,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error processing invoice payment:', error);
    return NextResponse.json(
      { error: { message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` } }, 
      { status: 500 }
    );
  }
}
