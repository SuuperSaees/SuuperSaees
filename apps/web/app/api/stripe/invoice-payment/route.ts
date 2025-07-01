import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      invoiceId,
      email,
      accountId,
      paymentMethodId,
      couponId,
      sessionId,
      customerId: customerProvidedId
    } = await request.clone().json();

    let customerId = customerProvidedId;

    const supabase = getSupabaseServerComponentClient(
      { admin: true },
    );

    console.log('Processing invoice payment for invoiceId:', invoiceId);

    // verify that customerId is provided
    if (!customerId ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const customer = await stripe.customers.create(
          { email },
          { stripeAccount: accountId },
        );
      customerId = customer.id;
    }

    // Verificar que la invoice existe en nuestra base de datos
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (
          id,
          description,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError ?? !invoice) {
      return NextResponse.json(
        { error: { message: 'Invoice not found' } },
        { status: 404 },
      );
    }

    let currentStripeInvoiceId = invoice.provider_id;
    
    // Si la invoice no tiene provider_id, necesitamos crearla en Stripe
    if (!invoice.provider_id || invoice.provider_id.trim() === '') {
      console.log('Invoice has no provider_id, creating in Stripe...');
      
      // Create the invoice in Stripe
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const stripeInvoice = await stripe.invoices.create(
        {
          customer: customerId,
          currency: invoice.currency?.toLowerCase() || 'usd',
          collection_method: 'charge_automatically',
          auto_advance: false, // No avanzar automáticamente para control manual
          description: invoice.notes ?? `Invoice #${invoice.number}`,
          // Note: No incluimos due_date porque collection_method es 'charge_automatically'
          // Stripe solo permite due_date con 'send_invoice'
          metadata: {
            suuper_invoice_id: invoiceId,
            suuper_invoice_number: invoice.number || '',
            suuper_due_date: invoice.due_date, // Guardamos la fecha de vencimiento en metadata
          },
        },
        { stripeAccount: accountId },
      );

      // Agregar los items de la invoice como invoice items
      if (invoice.invoice_items && invoice.invoice_items.length > 0) {
        for (const item of invoice.invoice_items) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await stripe.invoiceItems.create(
            {
              customer: customerId,
              invoice: stripeInvoice.id,
              unit_amount: Math.round(item.unit_price * 100), // Precio unitario en centavos
              quantity: item.quantity,
              currency: invoice.currency?.toLowerCase() || 'usd',
              description: item.description,
            },
            { stripeAccount: accountId },
          );
        }
      } else {
        // Si no hay items específicos, crear un item con el total
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await stripe.invoiceItems.create(
          {
            customer: customerId,
            invoice: stripeInvoice.id,
            amount: Math.round((invoice.total_amount || 0) * 100), // Convertir a centavos
            currency: invoice.currency?.toLowerCase() || 'usd',
            description: invoice.notes ?? `Payment for Invoice #${invoice.number}`,
          },
          { stripeAccount: accountId },
        );
      }

      // Finalizar la invoice para que pueda ser pagada
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(
        stripeInvoice.id,
        { stripeAccount: accountId },
      );

      currentStripeInvoiceId = finalizedInvoice.id;

      // Actualizar nuestra base de datos con el provider_id
      await supabase
        .from('invoices')
        .update({ provider_id: currentStripeInvoiceId })
        .eq('id', invoiceId);

      console.log(`Created and finalized Stripe invoice: ${currentStripeInvoiceId}`);
      
      // Nota: La factura se creó en Stripe y se finalizó, pero aún no está pagada.
      // El pago se procesará más adelante en este mismo flujo cuando se cree el payment intent.
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customerId },
      { stripeAccount: accountId },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await stripe.customers.update(
      customerId,
      {
        invoice_settings: { default_payment_method: paymentMethodId },
      },
      { stripeAccount: accountId },
    );

    // Obtener la invoice de Stripe
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const stripeInvoice = await stripe.invoices.retrieve(
      currentStripeInvoiceId,
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
        customer: customerId,
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
          stripeInvoiceId: currentStripeInvoiceId,
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

      // Si la factura fue creada nueva en Stripe (sin provider_id inicial), 
      // marcarla como pagada en Stripe también para mantener sincronización
      if (!invoice.provider_id || invoice.provider_id.trim() === '') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await stripe.invoices.pay(
            currentStripeInvoiceId,
            {
              payment_method: paymentMethodId,
            },
            { stripeAccount: accountId }
          );
          console.log(`Marked Stripe invoice as paid: ${currentStripeInvoiceId}`);
        } catch (stripePayError) {
          console.warn('Could not mark Stripe invoice as paid:', stripePayError);
          // No fallamos el flujo si no podemos marcar la factura en Stripe,
          // ya que el payment intent ya fue exitoso
        }
      }
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
