import { StripeIcon } from '~/components/icons/icons';
import { DollarSignIcon } from 'lucide-react';

export const paymentMethodsIcons = {
  mercadopago: (
    <div>
      <img
        src="images/checkout/mercadopago.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  stripedirect: (
    <div>
      <StripeIcon className="h-4 w-4" />
    </div>
  ),
  wompidirect: (
    <div>
      <img
        src="images/checkout/wompi.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  epaycodirect: (
    <div>
      <img
        src="images/checkout/epayco.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  payudirect: (
    <div>
      <img
        src="images/checkout/payu.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  placetopay: (
    <div>
      <img
        src="images/checkout/placetopay.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  openpaydirect: (
    <div>
      <img
        src="images/checkout/openpay.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  payucodirect: (
    <div>
      <DollarSignIcon className="h-4 w-4" />
    </div>
  ),
  placetopaydirect: (
    <div>
      <DollarSignIcon className="h-4 w-4" />
    </div>
  ),
  paymentswaydirect: (
    <div>
      <img
        src="images/checkout/paymentssway.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  dlocalgodirect: (
    <div>
      <img
        src="images/checkout/dlocal.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
  palommadirect: (
    <div>
      <DollarSignIcon className="h-4 w-4" />
    </div>
  ),
  coinkdirect: (
    <div>
      <DollarSignIcon className="h-4 w-4" />
    </div>
  ),
  payzendirect: (
    <div>
      <DollarSignIcon className="h-4 w-4" />
    </div>
  ),
  stripe: (
    <div>
      <img
        src="images/checkout/stripe.png"
        alt="Stripe"
        style={{
          minWidth: '60px',
          minHeight: '25px',
          maxHeight: '25px',
          objectFit: 'contain',
        }}
      />
    </div>
  ),
};