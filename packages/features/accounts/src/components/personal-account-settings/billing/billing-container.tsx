'use client';

import { useState } from 'react';
import { Card, CardContent } from "@kit/ui/card";
import { ArrowUpRight, CheckIcon, DownloadCloud } from "lucide-react";
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

const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentDate: "Dec 1, 2024",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentDate: "Dec 1, 2024",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentDate: "Dec 1, 2024",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentDate: "Dec 1, 2024",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentDate: "Dec 1, 2024",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentDate: "Dec 1, 2024",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentDate: "Dec 1, 2024",
    },
  ]
   
function UpgradePlanComponent() {
    return (
        <PlansContainer />
    );
}




export default function BillingContainerConfig() {
    const [showUpgradeComponent, setShowUpgradeComponent] = useState(false);

    const handleUpgradeClick = () => {
        setShowUpgradeComponent(true);
    };
    return (
        
        <div className="flex flex-col">
            {showUpgradeComponent ? (
                <UpgradePlanComponent />
            ) : (
                <>
                    <div className="flex gap-4 mb-[24px]">
                    <Card className="w-[424px] h-[225px] p-[24px] justify-between flex flex-col">
                    
                            <div className="overflow-hidden text-gray-900 truncate text-sm font-bold leading-5">Standard Plan</div>
                            
                            <div className="flex flex-col">
                                <div className="text-gray-900 font-inter text-lg font-normal leading-7">Next invoice issue date</div>
                                <div className="text-gray-900 font-inter text-5xl font-semibold leading-[60px] tracking-[-0.96px]">Sep 24, 2024</div>
                            </div>
                        
                    </Card>
                    <Card className="w-[619px] h-[225px] p-[24px] flex flex-col">
                    
                        <div className="text-gray-900 font-inter text-lg font-semibold leading-7">Invoice total</div>
                        <div className="text-gray-900 font-inter text-5xl font-semibold leading-[60px] tracking-[-0.96px] mb-[24px]">270 US$</div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-gray-900 font-inter text-sm font-medium leading-5">14 of 20 users</div>
                                <ThemedProgress value={70} className="w-[279.961px] h-[8px]" />
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
                                    {invoices.map((invoice) => (
                                    <TableRow key={invoice.invoice}>
                                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                        <TableCell>{invoice.totalAmount}</TableCell>
                                        <TableCell>{invoice.paymentDate}</TableCell>
                                        <TableCell>
                                            <div className="rounded-xl border border-[var(--Success-200,#ABEFC6)] bg-[var(--Success-50,#ECFDF3)] h-[22px] inline-flex items-center gap-1 px-2 py-0.5 pl-[var(--spacing-sm,6px)] text-[var(--Success-700,#067647)] text-center font-inter text-xs font-medium leading-4">
                                                {invoice.paymentStatus} <CheckIcon size={16} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="display: flex;padding: 8px;justify-content: center;align-items: center;gap: 8px; flex justify-center items-center gap-2 p-2"><DownloadCloud/></TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <div className="text-gray-900 font-inter text-lg font-semibold leading-7 mb-[2px]">Gestionar suscripción</div>
                            <div className="overflow-hidden text-[var(--Gray-600,#475467)] truncate font-inter text-sm font-normal leading-5">Update your photo and personal details here.</div>
                        </div>
                        <Button className="rounded-md border border-[var(--Gray-300,#D0D5DD)] bg-[var(--Base-White,#FFF)] shadow-xs"><div className="text-[var(--Gray-700,#344054)] font-inter text-sm font-semibold leading-5">Cancelar suscripción</div></Button>

                    </div>
                </>
            )
                
                }
        </div>
    )

}