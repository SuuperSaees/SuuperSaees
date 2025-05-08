'use client';

import { useState } from 'react';

import Link from 'next/link';

import { StarsIcon } from 'lucide-react';
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

import { useBilling } from '../../../../../apps/web/app/(main)/home/[account]/hooks/use-billing';
import { ThemedButton } from '../../../../features/accounts/src/components/ui/button-themed-with-settings';
import OrganizationSettingsProvider from '../../../../features/accounts/src/context/organization-settings-context';
import { useOrganizationSettings } from '../../../../features/accounts/src/context/organization-settings-context';

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
  const intervals = getPlanIntervals(productsDataConfig ?? { products: [] }).filter(Boolean) as string[];
  const [interval] = useState(intervals?.[0] ?? ''); 

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

  return (
    <div className={'flex h-full w-full flex-grow'}>
{ productsDataConfig?.products?.length ?
      (<div
        className={
          'flex justify-center flex-col gap-8 w-full md:flex-row'
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
                  plan={plan}
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

  const PremiumPlan = "premium"
  // const AdvancedPlan = "advanced"
  // const StarterPlan = "starter"
  const currentPlanName = props.product.name.toLowerCase()
  const isPremiumPlan = currentPlanName === PremiumPlan
  const urlScheduleDemo = "https://suuper.co/demo/"
  return (
    <div
      data-cy={'subscription-plan'}
      className={cn(
        props.className,
        `h-full w-96 max-w-full relative flex-col justify-between rounded-xl border shadow-md`,
        {
          ['border-primary']: highlighted,
          ['border-border']: !highlighted,
        },
      )}
    >
      <div className={'flex flex-col space-y-6'}>
        <div className='px-4 pt-6'>
        <div className={'flex flex-col space-y-2.5'}>
          <div className={'flex items-center space-x-6 justify-between mb-4'}>
            <b
              className={
                'text-current-foreground font-semibold tracking-tight text-slate-600 text-lg'
              }
            >
              <Trans
                i18nKey={`billing:plans.${currentPlanName}.name`}
              />
            </b>
            <If condition={isPremiumPlan}>
                <ThemedButton variant='outline' className='text-sm md:text-md lg:text-md absolute right-4 rounded-full px-2 py-1 pointer-events-none border font-medium' opacity={0.3}>
                  <span>
                    <Trans i18nKey={`billing:plans.${currentPlanName}.badge`} />
                  </span>
                </ThemedButton>
            </If>
          </div>

        </div>

        <div className={'flex space-y-1 gap-2 mb-4 items-center justify-center'}>
          <Price >
            <span className='text-5xl md:text-6xl lg:text-7xl font-semibold'>
            {lineItem ? (
              formatCurrency(props.product.currency, lineItem.cost)
            ) : props.plan.label ? (
              <Trans i18nKey={props.plan.label} defaults={props.plan.label} />
            ) : (
              <Trans i18nKey={'billing:custom'} />
            )}
            </span>
          </Price>

          <If condition={props.plan.name}>
            <span
              className={cn(
                `animate-in slide-in-from-left-4 fade-in text-slate-800 flex items-center space-x-0.5 text-md font-medium justify-center min-w-36 max-w-40`,
              )}
            >
              <Trans i18nKey={`billing:plans.features.perMemberPerMonth`} />
            </span>
          </If>
        </div>
        <span className='text-slate-800 text-lg'>
          <Trans i18nKey={`billing:plans.${currentPlanName}.description`} />
        </span>
        <div className='mt-4 flex flex-col gap-4'>
          <ThemedButton onClick={() => props?.checkoutButtonRenderer?.(lineItem?.cost ?? 0, props.plan.id)} disabled={props.plan.id === props.subscriptionFetchedStripe?.plan.id}
          className='w-full text-lg py-6'
            >{props.plan.id === props.subscriptionFetchedStripe?.plan.id ? <Trans i18nKey={`billing:plans.currentPlan`} /> : <Trans i18nKey={`billing:plans.upgrade`} />}</ThemedButton>
          <Link href={urlScheduleDemo} className="w-full" target="_blank">
            <Button className="w-full text-lg py-6" variant="outline">
              <Trans i18nKey={`billing:plans.scheduleDemo`} />
            </Button>
          </Link>
        </div>
        </div>

        <Separator className="w-full" />

        <div className={'flex flex-col text-lg pt-0 pb-4 px-4'}>
          <h6 className={'font-semibold uppercase'}>
            <Trans i18nKey={`billing:plans.whatIncludes`} />
          </h6>
          <span className='text-slate-800 mb-4'>
            <Trans i18nKey={`billing:plans.${currentPlanName}.features.base`} />
          </span>
          <FeaturesList
            highlighted={highlighted}
            features={props.product.features}
            isPremiumPlan={isPremiumPlan}
            currentPlanName={currentPlanName}
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
    isPremiumPlan: boolean;
    currentPlanName: string;
  }>,
) {
  return (
    <ul className={'flex flex-col space-y-2'}>
      {props.features?.map((feature) => {
        return (
          <>{feature ? <ListItem key={feature} currentPlanName={props.currentPlanName} isPremiumPlan={props.isPremiumPlan} feature={feature}>
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

function ListItem({ currentPlanName, isPremiumPlan, feature }: React.PropsWithChildren<{currentPlanName: string, isPremiumPlan: boolean, feature: string}>) {
  const customDomain = "customdomain"
  const isCustomDomain = feature.toLowerCase().trim().split(" ").join("") === customDomain && isPremiumPlan
  const { theme_color } = useOrganizationSettings();

  return (
    <OrganizationSettingsProvider initialSettings={[]}>

  <li className={'flex items-center space-x-2.5'}>
      {
        !isCustomDomain ?  <div className='flex items-center justify-center rounded-full border-2 p-[1px]' style={{borderColor: theme_color}}>
        <div className="relative w-3 h-3 scale-x-[-1] flex justify-center items-center">
          <div className="absolute transform rotate-45 mt-[2.5px] border-b-[2px] border-r-[2px] w-2 h-[5px] -top-[1px] left-[2px]" style={{borderColor: theme_color}}></div>
        </div>
      </div> : <StarsIcon className={' h-4 min-h-4 w-4 min-w-4'} style={{color: theme_color}}/>
      }

      <span
        className={cn({
          ['text-secondary-foreground']: true,
        })}
      >
        <Trans i18nKey={`billing:plans.${currentPlanName}.features.${feature}`} />
      </span>
    </li>


    </OrganizationSettingsProvider>
  
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
