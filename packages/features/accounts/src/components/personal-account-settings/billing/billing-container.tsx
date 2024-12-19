'use client';

import { useState } from 'react';
import { Card, CardContent } from "@kit/ui/card";
import { ArrowUpRight, CheckIcon, Link2Icon } from "lucide-react";
import { Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@kit/ui/table";
import { Button } from "@kit/ui/button";
// import { ThemedProgress } from "../../ui/progress-themed-with-settings";
import PlansContainer from '../../../../../../../apps/web/app/select-plan/components/plans-container';
import { useBilling } from '../../../../../../../apps/web/app/home/[account]/hooks/use-billing';
import { cancelSubscription } from '../../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/delete/cancel-subscription'
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function BillingContainerConfig({ tab }: { tab: string }) {
    const [modalCancelSubscription, setModalCancelSubscription] = useState(false)
    const [cancelSubscriptionInput, setCancelSubscriptionInput] = useState("")
    const { subscriptionFetchedStripe, productSubscription, invoices, upcomingInvoice, updateSubscriptionContext, showUpgradeComponent, setShowUpgradeComponent } = useBilling();
    const { t } = useTranslation('invoices');
    useEffect(() => {
        if (tab === 'billing') {
            setShowUpgradeComponent(true);
        }
      });
    const formatUnixToMonthYear = (unixTimestamp: number, includeDay: boolean) => {
        if (!unixTimestamp) return '';
        const date = new Date(unixTimestamp * 1000);
        
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        if (includeDay) {
          const day = date.getDate();
          return `${month} ${day} ${year}`;
        }
      
        return `${month} ${year}`;
      }
    const handleUpgradeClick = () => {
        setShowUpgradeComponent(true);
    };

    const calculateTotalAmountPaid = (total: number): number => {
        return total / 100;
    };


    //   const getPlanValue = (plan: string): number => {
    //     const planValues: Record<string, number> = {
    //       starter: 1,
    //       standard: 5,
    //       premium: 10,
    //       enterprise: 20
    //     };
      
    //     return planValues[plan?.toLowerCase()] ?? 0;
    //   };

    //   const getProgressPercentage = (occupied: any, available: any) => {
    //     if (available <= 0) return 0;
    //     if (occupied < 0) occupied = 0;
        
    //     const percentage = (occupied / available) * 100;
      
    //     return Math.max(1, Math.min(100, Math.round(percentage)));
    //   };
      
      const handleCancelSubscription = async (subscriptionId: string) => {
        // Implement cancel subscription logic here
        try {
            await cancelSubscription(subscriptionId)
            toast.success('Success', {
              description: 'Subscription canceled successfully',
            });
            void updateSubscriptionContext()
            setModalCancelSubscription(false)
          } catch (error) {
            toast.error('Error', {
              description: 'Error trying to cancel subscription',
            });
          }
      };
      const planName = productSubscription?.name as string;
      const currentPlanName = planName?.toLowerCase();
      const availablePlansToCancel = new Set(["starter", "premium", "advanced"]);
    return (
        
        <div className="flex flex-col">
            {showUpgradeComponent ? (
                <PlansContainer seats={subscriptionFetchedStripe?.quantity}/>
            ) : (
                <>
                    <div className="flex gap-4 mb-[24px]">
                    <Card className="w-[424px] h-[225px] p-[24px] justify-between flex flex-col">
                    
                            <div className="overflow-hidden text-gray-900 truncate text-sm font-bold leading-5">{productSubscription?.name} {t('plan.title')}</div>
                            
                            <div className="flex flex-col">
                                <div className="text-gray-900 font-inter text-lg font-normal leading-7">{t('plan.nextInvoice')}</div>
                                <div className="text-gray-900 font-inter text-5xl font-semibold leading-[60px] tracking-[-0.96px]">{formatUnixToMonthYear(upcomingInvoice?.next_payment_attempt, true)}</div>
                            </div>
                        
                    </Card>
                    <Card className="w-[619px] h-[225px] p-[24px] flex flex-col">
                    
                        <div className="text-gray-900 font-inter text-lg font-semibold leading-7">{t('total.title')}</div>
                        <div className="text-gray-900 font-inter text-5xl font-semibold leading-[60px] tracking-[-0.96px] mb-[24px]">{calculateTotalAmountPaid(upcomingInvoice?.total ?? 0)} US$</div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-gray-900 font-inter text-sm font-medium leading-5">{t('total.usersEquivalent', { currentUsers: subscriptionFetchedStripe?.quantity ?? 0}) + ' ' + `${subscriptionFetchedStripe?.quantity === 1 ? t('total.user') : t('total.users')}`}</div>
                                {/* <ThemedProgress value={getProgressPercentage(subscriptionFetchedStripe?.quantity, getPlanValue(productSubscription?.name))} className="w-[279.961px] h-[8px]" /> */}
                            </div>
                            <div className="text-brand text-sm font-semibold leading-5 flex gap-2 cursor-pointer" onClick={handleUpgradeClick}>
                                {t('total.upgrade')}
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                    </Card>

                    </div>
                    <div className="flex flex-col mb-[24px]">
                        <div className="text-gray-900 font-inter text-lg font-semibold leading-7 mb-[24px]">{t('history.title')}</div>
                        <Card>
                            <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('history.invoice')}</TableHead>
                                        <TableHead className="w-[100px]">{t('history.amount')}</TableHead>
                                        <TableHead className="w-[100px]">{t('history.date')}</TableHead>
                                        <TableHead className="w-[100px]">{t('history.status')}</TableHead>  
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices?.map((invoice) => (
                                    <TableRow key={invoice?.id}>
                                        <TableCell className="font-medium">{productSubscription?.name} Plan - {formatUnixToMonthYear(invoice?.created, false)}</TableCell>
                                        <TableCell>{invoice.total/100}</TableCell>
                                        <TableCell>{formatUnixToMonthYear(invoice?.created, true)}</TableCell>
                                        <TableCell>
                                            <div className="rounded-xl border border-[var(--Success-200,#ABEFC6)] bg-[var(--Success-50,#ECFDF3)] h-[22px] inline-flex items-center gap-1 px-2 py-0.5 pl-[var(--spacing-sm,6px)] text-[var(--Success-700,#067647)] text-center font-inter text-xs font-medium leading-4">
                                                {invoice.paymentStatus} <CheckIcon size={16} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="display: flex;padding: 8px;justify-content: center;align-items: center;gap: 8px; flex justify-center items-center gap-2 p-2 cursor-pointer"><a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                                                                <Link2Icon />
                                                            </a>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </CardContent>
                        </Card>
                    </div>
                   {(availablePlansToCancel.has(currentPlanName)) && <div className="flex justify-between">
                        <div className="flex flex-col">
                            <div className="text-gray-900 font-inter text-lg font-semibold leading-7 mb-[2px]">{t('manage.title')}</div>
                            <div className="overflow-hidden text-[var(--Gray-600,#475467)] truncate font-inter text-sm font-normal leading-5">{t('manage.description')}</div>
                        </div>
                        <Button variant={"ghost"} className="rounded-md border border-[var(--Gray-300,#D0D5DD)] bg-[var(--Base-White,#FFF)] shadow-xs"><div className="text-[var(--Gray-700,#344054)] font-inter text-sm font-semibold leading-5" onClick={()=>setModalCancelSubscription(true)}>{t('manage.cancel')}</div></Button>

                    </div>}
                    {modalCancelSubscription && <div className='fixed w-[100vw] h-[100vh] bg-slate-50 bg-opacity-50 z-40'>
                        <Card className="flex flex-col absolute z-50 top-[35%] right-[50%] p-6 shadow-md">
                        <div className="text-gray-900 font-inter text-lg font-semibold leading-7 mb-4">{t('modal.cancel.title')}</div>
                        <div className="overflow-hidden text-slate-950 truncate font-inter text-sm font-normal leading-5 mb-4">{t('modal.cancel.description.paragraph1')}</div>
                        <div className="overflow-hidden text-slate-950 truncate font-inter text-sm font-normal leading-5 mb-4">
                         {t('modal.cancel.description.paragraph2.text1')} <strong>&quot;cancel_subscription&quot;</strong> {t('modal.cancel.description.paragraph2.text2')}
                        </div>
                        <input
                            type="text"
                            placeholder={t('modal.cancel.placeholder')}
                            value={cancelSubscriptionInput}
                            onChange={(e) => setCancelSubscriptionInput(e.target.value)}
                            className="mb-4 p-2 border border-gray-300 rounded"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button disabled={!(cancelSubscriptionInput === "cancel_subscription")} variant={"destructive"} onClick={()=>handleCancelSubscription(subscriptionFetchedStripe?.id)}><div className="text-[var(--Gray-700, #344054)] font-inter text-sm font-semibold leading-5">{t('modal.cancel.cancelButton')}</div></Button>
                            <Button variant={"ghost"} onClick={()=>setModalCancelSubscription(false)} className="rounded-md border border-[var(--Gray-300, #D0D5DD)] bg-[var(--Base-White, #FFF)] shadow-xs"><div className="text-[var(--Gray-700, #344054)] font-inter text-sm font-semibold leading-5">{t('modal.cancel.backButton')}</div></Button>
                        </div>
                    </Card></div>}
                </>
            )
                
                }
        </div>
    )

}