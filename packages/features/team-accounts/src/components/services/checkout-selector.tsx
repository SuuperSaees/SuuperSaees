'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Button } from '@kit/ui/button';
import { ShoppingBag, CopyIcon, DollarSignIcon} from 'lucide-react';

import { BillingAccounts } from '../../../../../../apps/web/lib/billing-accounts.types';
import { Service } from '../../../../../../apps/web/lib/services.types';
import {
    MercadoPagoIcon,
    StripeIcon,
    WompiIcon,
    // EpaycoIcon,
    // PayuIcon,
    // PlaceToPayIcon,
    // OpenpayIcon,
    // PayuCoIcon,
    // PlaceToPayDirectIcon,
    // PaymentsWayIcon,
    // DlocalGoIcon,
    // PalomaIcon,
    // CoinkIcon,
    // PayzenIcon,
} from "../../../../../../apps/web/components/icons/icons"

type CheckoutSelectorProps = {
  service: Service.Relationships.Billing.BillingService;
  paymentsMethods: BillingAccounts.PaymentMethod[];
  onAction: (service: Service.Relationships.Billing.BillingService, paymentMethod: BillingAccounts.PaymentMethod) => Promise<void>;
}

const paymentMethodsIcons = {
  mercadopago: <MercadoPagoIcon className="h-5 w-5" />,
  stripedirect: <StripeIcon className="h-5 w-5" />,
  wompidirect: <WompiIcon className="h-5 w-5" />,
  epaycodirect: <DollarSignIcon className="h-5 w-5" />,
  payudirect: <DollarSignIcon className="h-5 w-5" />,
  placetopay: <DollarSignIcon className="h-5 w-5" />,
  openpaydirect: <DollarSignIcon className="h-5 w-5" />,
  payucodirect: <DollarSignIcon className="h-5 w-5" />,
  placetopaydirect: <DollarSignIcon className="h-5 w-5" />,
  paymentswaydirect: <DollarSignIcon className="h-5 w-5" />,
  dlocalgodirect: <DollarSignIcon className="h-5 w-5" />,
  palommadirect: <DollarSignIcon className="h-5 w-5" />,
  coinkdirect: <DollarSignIcon className="h-5 w-5" />,
  payzendirect: <DollarSignIcon className="h-5 w-5" />,
  stripe: <StripeIcon className="h-5 w-5" />,
};

export function CheckoutSelector({ 
  service,
  paymentsMethods,
  onAction,
}: CheckoutSelectorProps) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
        >
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          className="w-56 rounded-md border bg-white p-1 shadow-md"
          align="end"
        >
          {paymentsMethods.map((option) => (
            <DropdownMenuItem
              key={option.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm p-2 outline-none hover:bg-gray-100"
              onClick={() => onAction(service, option)}
            >
              <div className="flex items-center gap-2">
                {paymentMethodsIcons[option.id as keyof typeof paymentMethodsIcons]}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.name}</span>
                  {/* <span className="text-xs text-gray-500">
                    {option.description}
                  </span> */}
                </div>
              </div>
              <CopyIcon className="ml-auto h-4 w-4 text-gray-400" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}