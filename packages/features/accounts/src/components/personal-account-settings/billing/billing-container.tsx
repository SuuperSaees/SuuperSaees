'use client';

import { use, useState } from 'react';
import { Card, CardContent } from "@kit/ui/card";
import { ArrowUpRight, CheckIcon, Link2Icon } from "lucide-react";
// import Link from "next/link";
// import { Progress } from '../../../../../../../packages/ui/src/shadcn/progress';
import { Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@kit/ui/table";
import { Button } from "@kit/ui/button";
import { ThemedProgress } from "../../ui/progress-themed-with-settings";
import PlansContainer from '../../../../../../../apps/web/app/select-plan/components/plans-container';
import { useBillingContext } from '../../../../../../../apps/web/app/home/[account]/contexts/billing-context';
   
function UpgradePlanComponent() {
    return (
        <PlansContainer />
    );
}

export default function BillingContainerConfig() {
    const [showUpgradeComponent, setShowUpgradeComponent] = useState(false);
    const { subscription, subscriptionFetchedStripe, productSubscription, invoices, upcomingInvoice } = useBillingContext();

    const formatUnixToMonthYear = (unixTimestamp: number, includeDay: boolean) => {
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
    
    const calculateTotalAmountPaid = (invoices: any[]): number => {
        return invoices?.reduce((total, invoice) => total + invoice.total, 0);
      };

      const getPlanValue = (plan: string): number => {
        const planValues: Record<string, number> = {
          starter: 1,
          standard: 5,
          premium: 10,
          enterprise: 20
        };
      
        return planValues[plan.toLowerCase()] || 0;
      };

      const getProgressPercentage = (occupied: any, available: any) => {
        if (available <= 0) return 0;
        if (occupied < 0) occupied = 0;
        
        const percentage = (occupied / available) * 100;
      
        return Math.max(1, Math.min(100, Math.round(percentage)));
      };
      
    return (
        
        <div className="flex flex-col">
            {showUpgradeComponent ? (
                <UpgradePlanComponent />
            ) : (
                <>
                    <div className="flex gap-4 mb-[24px]">
                    <Card className="w-[424px] h-[225px] p-[24px] justify-between flex flex-col">
                    
                            <div className="overflow-hidden text-gray-900 truncate text-sm font-bold leading-5">{productSubscription?.name} Plan</div>
                            
                            <div className="flex flex-col">
                                <div className="text-gray-900 font-inter text-lg font-normal leading-7">Next invoice issue date</div>
                                <div className="text-gray-900 font-inter text-5xl font-semibold leading-[60px] tracking-[-0.96px]">{formatUnixToMonthYear(upcomingInvoice?.next_payment_attempt, true)}</div>
                            </div>
                        
                    </Card>
                    <Card className="w-[619px] h-[225px] p-[24px] flex flex-col">
                    
                        <div className="text-gray-900 font-inter text-lg font-semibold leading-7">Invoice total</div>
                        <div className="text-gray-900 font-inter text-5xl font-semibold leading-[60px] tracking-[-0.96px] mb-[24px]">{calculateTotalAmountPaid(invoices)} US$</div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-gray-900 font-inter text-sm font-medium leading-5">{subscriptionFetchedStripe?.quantity} of {getPlanValue(productSubscription?.name)} users</div>
                                <ThemedProgress value={getProgressPercentage(subscriptionFetchedStripe?.quantity, getPlanValue(productSubscription?.name))} className="w-[279.961px] h-[8px]" />
                            </div>
                            <div className="text-brand text-sm font-semibold leading-5 flex gap-2 cursor-pointer" onClick={handleUpgradeClick}>
                                Upgrade your plan <ArrowUpRight size={16} />
                            </div>
                        </div>
                    </Card>

                    </div>
                    <div className="flex flex-col mb-[24px]">
                        <div className="text-gray-900 font-inter text-lg font-semibold leading-7 mb-[24px]">Billing history</div>
                        <Card>
                            <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead className="w-[100px]">Amount</TableHead>
                                        <TableHead className="w-[100px]">Date</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices?.map((invoice) => (
                                    <TableRow key={invoice?.id}>
                                        <TableCell className="font-medium">{productSubscription?.name} Plan - {formatUnixToMonthYear(invoice?.created, false)}</TableCell>
                                        <TableCell>{invoice.total}</TableCell>
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
                    {/* <div className="flex justify-between">
                        <div className="flex flex-col">
                            <div className="text-gray-900 font-inter text-lg font-semibold leading-7 mb-[2px]">Gestionar suscripción</div>
                            <div className="overflow-hidden text-[var(--Gray-600,#475467)] truncate font-inter text-sm font-normal leading-5">Update your photo and personal details here.</div>
                        </div>
                        <Button className="rounded-md border border-[var(--Gray-300,#D0D5DD)] bg-[var(--Base-White,#FFF)] shadow-xs"><div className="text-[var(--Gray-700,#344054)] font-inter text-sm font-semibold leading-5">Cancelar suscripción</div></Button>

                    </div> */}
                </>
            )
                
                }
        </div>
    )

}