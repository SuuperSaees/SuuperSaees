'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, PenLine } from 'lucide-react';
import { Trans } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@kit/ui/button';
import { Order } from '~/lib/order.types';
import { updateOrder } from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import { useActivityContext } from '../context/activity-context';

export const OrderHeader = ({ order }: { order: Order.Relational }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [orderName, setOrderName] = useState(order?.title);
  const { userRole } = useActivityContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleSave = async () => {
    if (orderName === '') {
      setIsEditing(false);
      setOrderName(order.title);
      toast.error('Order title cannot be empty');
      return;
    }
    if (orderName !== order.title) {
      try {
        setIsEditing(false);
        await updateOrder(order.id, { title: orderName });
        toast.success('Order title updated successfully');
      } catch (error) {
        console.error('Error updating order title:', error);
        toast.error('Error updating order title');
      }
    } else {
      setIsEditing(false);
    }
  };

  const updateInputWidth = () => {
    if (spanRef.current && inputRef.current) {
      const spanWidth = spanRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.min(spanWidth, window.innerWidth * 0.6)}px`;
    }
  };

  useEffect(() => {
    updateInputWidth();
  }, [orderName, isEditing]);

  const rolesThatCanEdit = new Set(['agency_member', 'agency_project_manager', 'agency_owner']);
  const canEdit = rolesThatCanEdit.has(userRole);

  return (
    <div>
      <div className="mb-2 flex max-w-[60vw] items-center justify-start gap-2">
        <div className="inline-flex w-full">
          {canEdit && isEditing ? (
            <>
              <input
                type="text"
                ref={inputRef}
                disabled={!isEditing}
                className="h-15 flex min-w-0 max-w-full items-center justify-between rounded-md border-none bg-slate-50 px-2 text-[36px] font-semibold text-primary-900 outline-none overflow-x-auto disabled:bg-transparent disabled:pl-0 disabled:pr-2 disabled:text-primary-900"
                value={orderName}
                onChange={(event) => setOrderName(event.target.value)}
              />
              <span
                ref={spanRef}
                className="absolute invisible min-w-0 max-w-[60vw] whitespace-nowrap px-2 text-[36px] font-semibold text-primary-900 overflow-x-auto"
              >
                {orderName}
              </span>
              <Button
                variant="ghost"
                className="h-15 m-0 text-slate-500"
                onClick={handleSave}
              >
                <Check />
              </Button>
            </>
          ) : (
            <>
              <span className="min-w-0 max-w-[60vw] overflow-x-auto whitespace-nowrap px-2 text-[36px] font-semibold text-primary-900">
                {orderName.slice(0, 45).trim()}
                {orderName.length > 45 && '...'}
              </span>
              {canEdit && (
                <Button
                  variant="ghost"
                  className="h-15 m-0 text-slate-500"
                  onClick={() => {
                    setIsEditing(true);
                    updateInputWidth();
                  }}
                >
                  <PenLine />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <h3 className="relative mb-2">
        <Trans i18nKey="details.orderId" /> {order?.id}
      </h3>
    </div>
  );
};

export default OrderHeader;