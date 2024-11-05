'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CheckCircle } from 'lucide-react';
import { z } from 'zod';

import {
  LineItemSchema,
  getPlanIntervals,
  getPrimaryLineItem,
} from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { useBilling } from '../../../../../apps/web/app/home/[account]/hooks/use-billing';
import { ThemedButton } from '../../../../features/accounts/src/components/ui/button-themed-with-settings';

interface Paths {
  signUp: string;
  return: string;
}

export function PricingTable({
  paths,
  checkoutButtonRenderer,
  redirectToCheckout = true,
  displayPlanDetails = true,
  productsDataConfig
}: {
  paths: Paths;
  displayPlanDetails?: boolean;
  redirectToCheckout?: boolean;
  productsDataConfig:  {
    products: any[];
} | null;
  checkoutButtonRenderer?: (amount: number, priceId: string)=> void;
}) {
  const { subscriptionFetchedStripe } = useBilling()

  
  if (!productsDataConfig) {
    return (
      <div className="items-center justify-center flex flex-col mt-10">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  const intervals = getPlanIntervals(productsDataConfig).filter(Boolean) as string[];
  const [interval, setInterval] = useState(intervals[0] ?? ''); 
  return (
    <div className={'flex flex-col space-y-8 xl:space-y-12'}>
{ productsDataConfig?.products?.length ?
      (<div
        className={
          'flex flex-col items-start space-y-6 lg:space-y-0 mt-4 mb-4' +
          ' justify-center lg:flex-row lg:space-x-4'
        }
      >
        {Array.isArray(productsDataConfig.products) && productsDataConfig.products.length > 0 ? (
          productsDataConfig?.products?.map((product: { plans?: any; id?: string; name?: string; currency?: string; description?: string; badge?: string | undefined; highlighted?: boolean | undefined; features?: string[]; }) => {
            if (!Array.isArray(product.plans)) {
              return null; 
            }

            const plan = product.plans.find((plan: { paymentType: string; interval: string; }) => {
              if (plan.paymentType === 'recurring') {
                return plan.interval === interval;
              }
              return plan;
            });

            if (!plan) {
              return null;
            }
            
            const primaryLineItem = getPrimaryLineItem(productsDataConfig, plan.id);

            if (!plan.custom && !primaryLineItem) {
              throw new Error(`Primary line item not found for plan ${plan.id}`);
            }
              return (
                <PricingItem
                  selectable
                  key={plan?.id}
                  plan={plan!}
                  redirectToCheckout={redirectToCheckout}
                  primaryLineItem={primaryLineItem}
                  product={product}
                  paths={paths}
                  subscriptionFetchedStripe={subscriptionFetchedStripe}
                  displayPlanDetails={displayPlanDetails}
                  checkoutButtonRenderer={checkoutButtonRenderer}
                />
              );
          })
        ) : (
          <div>No hay productos disponibles.</div> 
        )}
      </div>) : <div></div>}
    </div>
  );
}


function PricingItem(
  props: React.PropsWithChildren<{
    className?: string;
    displayPlanDetails: boolean;
    subscriptionFetchedStripe: any;
    paths: Paths;

    selectable: boolean;

    primaryLineItem: z.infer<typeof LineItemSchema> | undefined;

    redirectToCheckout?: boolean;

    plan: {
      id: string;
      lineItems: z.infer<typeof LineItemSchema>[];
      interval?: string;
      name?: string;
      href?: string;
      label?: string;
    };

    checkoutButtonRenderer?: (amount: number, priceId: string)=> void;

    product: {
      id: string;
      name: string;
      currency: string;
      description: string;
      badge?: string;
      highlighted?: boolean;
      features: string[];
    };
  }>,
) {
  const highlighted = props.product.highlighted ?? false;
  const lineItem = props.primaryLineItem;
  // we exclude flat line items from the details since
  // it doesn't need further explanation
  // const lineItemsToDisplay = props.plan.lineItems.filter((item) => {
  //   return item.type !== 'flat';
  // });


  return (
    <div
      data-cy={'subscription-plan'}
      className={cn(
        props.className,
        `s-full relative flex flex-1 grow flex-col items-stretch justify-between self-stretch rounded-xl border lg:w-4/12 xl:max-w-[18rem] shadow-md`,
        {
          ['border-primary']: highlighted,
          ['border-border']: !highlighted,
        },
      )}
    >
      <div className={'flex flex-col space-y-6'}>
        <div className='px-4 pt-4'>
        <div className={'flex flex-col space-y-2.5'}>
          <div className={'flex items-center space-x-6'}>
            <b
              className={
                'text-current-foreground font-semibold tracking-tight text-slate-800 text-md mb-4'
              }
            >
              Plan <Trans
                i18nKey={props.product.name}
                defaults={props.product.name}
              />
            </b>
          </div>

        </div>

        <div className={'flex space-y-1 gap-2 mb-4'}>
          <Price>
            {lineItem ? (
              formatCurrency(props.product.currency, lineItem.cost)
            ) : props.plan.label ? (
              <Trans i18nKey={props.plan.label} defaults={props.plan.label} />
            ) : (
              <Trans i18nKey={'billing:custom'} />
            )}
          </Price>

          <If condition={props.plan.name}>
            <span
              className={cn(
                `animate-in slide-in-from-left-4 fade-in text-slate-800 flex items-center space-x-0.5 text-sm`,
              )}
            >
              por miembro de tu equipo al mes
            </span>
          </If>
        </div>
        <span className='text-slate-800 text-sm'>
          Ideal para comenzar tu negocio de servicios digitales.
        </span>
        <div className='mt-4 flex flex-col gap-2'>
          <ThemedButton onClick={()=>props?.checkoutButtonRenderer(lineItem?.cost!, props.plan.id)} disabled={props.plan.id === props.subscriptionFetchedStripe?.plan.id}
          className='w-full'
            >{props.plan.id === props.subscriptionFetchedStripe?.plan.id ? "Actual" : "Mejorar"}</ThemedButton>
          <Link href={"https://suuper.co/demo/"} className="w-full" target="_blank">
            <Button className="w-full" variant="outline">Agenda una demo</Button>
          </Link>
        </div>
        </div>

        <Separator className="w-full" />

        <div className={'flex flex-col pt-0 pb-4 px-4'}>
          <h6 className={'text-sm font-semibold uppercase'}>Qué incluye</h6>
          <span className='text-slate-800 text-sm mb-2'>
            Funcionalidades más básicas y...
          </span>
          <FeaturesList
            highlighted={highlighted}
            features={props.product.features}
          />
        </div>
      </div>
    </div>
  );
}

function FeaturesList(
  props: React.PropsWithChildren<{
    features: string[];
    highlighted?: boolean;
  }>,
) {
  return (
    <ul className={'flex flex-col space-y-2'}>
      {props.features?.map((feature) => {
        return (
          <>{feature ? <ListItem key={feature}>
            <Trans i18nKey={feature} defaults={feature} />
          </ListItem> : <div></div>}</>
        );
      })}
    </ul>
  );
}

function Price({ children }: React.PropsWithChildren) {
  return (
    <div
      className={`animate-in slide-in-from-left-4 fade-in items-center duration-500`}
    >
      <span
        className={
          'font-heading flex items-center text-3xl font-bold tracking-tighter lg:text-4xl'
        }
      >
        {children}
      </span>
    </div>
  );
}

function ListItem({ children }: React.PropsWithChildren) {
  return (
    <li className={'flex items-center space-x-2.5'}>
      <CheckCircle className={'text-primary h-4 min-h-4 w-4 min-w-4'} />

      <span
        className={cn('text-sm', {
          ['text-secondary-foreground']: true,
        })}
      >
        {children}
      </span>
    </li>
  );
}

// function PlanIntervalSwitcher(
//   props: React.PropsWithChildren<{
//     intervals: string[];
//     interval: string;
//     setInterval: (interval: string) => void;
//   }>,
// ) {
//   return (
//     <div className={'flex'}>
//       {props.intervals?.map((plan, index) => {
//         const selected = plan === props.interval;

//         const className = cn(
//           'focus:!ring-0 !outline-none animate-in transition-all fade-in',
//           {
//             'rounded-r-none border-r-transparent': index === 0,
//             'rounded-l-none': index === props.intervals.length - 1,
//             ['hover:text-primary border text-muted-foreground']: !selected,
//             ['font-semibold cursor-default hover:text-initial hover:bg-background']:
//               selected,
//           },
//         );

//         return (
//           <Button
//             key={plan}
//             variant={'outline'}
//             className={className}
//             onClick={() => props.setInterval(plan)}
//           >
//             <span className={'flex items-center space-x-1'}>
//               <If condition={selected}>
//                 <CheckCircle className={'animate-in fade-in zoom-in-90 h-4'} />
//               </If>

//               <span className={'capitalize'}>
//                 <Trans i18nKey={`common:billingInterval.${plan}`} />
//               </span>
//             </span>
//           </Button>
//         );
//       })}
//     </div>
//   );
// }

// function DefaultCheckoutButton(
//   props: React.PropsWithChildren<{
//     plan: {
//       id: string;
//       name?: string | undefined;
//       href?: string;
//       buttonLabel?: string;
//     };

//     product: {
//       name: string;
//     };

//     paths: Paths;
//     redirectToCheckout?: boolean;

//     highlighted?: boolean;
//   }>,
// ) {
//   const { t } = useTranslation('billing');

//   const signUpPath = props.paths.signUp;

//   const searchParams = new URLSearchParams({
//     next: props.paths.return,
//     plan: props.plan.id,
//     redirectToCheckout: props.redirectToCheckout ? 'true' : 'false',
//   });

//   const linkHref =
//     props.plan.href ?? `${signUpPath}?${searchParams.toString()}` ?? '';

//   const label = props.plan.buttonLabel ?? 'common:getStartedWithPlan';

//   return (
//     <Link className={'w-full'} href={linkHref}>
//       <Button
//         size={'lg'}
//         className={'border-primary w-full rounded-lg border'}
//         variant={props.highlighted ? 'default' : 'outline'}
//       >
//         <span>
//           <Trans
//             i18nKey={label}
//             defaults={label}
//             values={{
//               plan: t(props.product.name, {
//                 defaultValue: props.product.name,
//               }),
//             }}
//           />
//         </span>

//         <ArrowRight className={'ml-2 h-4'} />
//       </Button>
//     </Link>
//   );
// }
