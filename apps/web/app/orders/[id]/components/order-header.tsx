'use client';

import { Trans } from 'react-i18next';
import { Order } from '~/lib/order.types';
import { Activity } from '~/lib/activity.types';
import { Message } from '~/lib/message.types';
import { File } from '~/lib/file.types';
import { Review } from '~/lib/review.types';
import { User as ServerUser } from '~/lib/user.types';
type User = Pick<ServerUser.Type, 'email' | 'id' | 'name' | 'picture_url'>;
import { toast } from 'sonner';
import { PenLine, Check } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { useEffect, useState } from 'react';
import { updateOrder } from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

type OrderWithAllRelations = Order.Relationships.All & {
    messages: (Message.Type & { user: User; files: File.Type[] })[];
    files: (File.Type & { user: User })[];
    activities: (Activity.Type & { user: User })[];
    reviews: (Review.Type & { user: User })[];
    client: User;
    assigned_to: {
      agency_member: User;
    }[];
    followers: {
      client_follower: User;
    }[];
  };


//   useEffect(() => {
//     const fetchUserRole = async () => {
//       await getUserRole().then((data)=> {
//         setUserRole(data);
//       }).catch((error) => {
//         console.error('Error al obtener el rol del usuario:', error);
//       })
//     };

export const OrderHeader = ({ order }: { order: OrderWithAllRelations }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [orderName, setOrderName] = useState(order?.title);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const fetchUserRole = async () => {
            await getUserRole().then((data)=> {
              setUserRole(data);
            }).catch((error) => {
              console.error('Error al obtener el rol del usuario:', error);
            })
          };

        void fetchUserRole();
    }, []);

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

    return (
        <div>
            <div className="flex gap-2 items-center w-fit mb-2">
                <input
                    type="text"
                    disabled={!isEditing}
                    className="text-primary-900 px-2 disabled:px-0 flex h-15 items-center rounded-md justify-between bg-slate-50 disabled:bg-transparent outline-none border-none disabled:text-primary-900 text-[36px] font-semibold w-fit"
                    value={orderName} // Cambiado a value para controlar el input
                    onChange={(event) => setOrderName(event.target.value)}
                />
                {
                    isEditing && ["agency_member", "agency_owner"].includes(userRole) ? (
                        <Button variant="ghost" className="text-slate-500 h-15 m-0" onClick={handleSave}>
                            <Check />
                        </Button>
                    ) : (
                        ["agency_member", "agency_owner"].includes(userRole) && <Button variant="ghost" className="text-slate-500 h-15 m-0" onClick={() => setIsEditing(true)}>
                            <PenLine />
                        </Button>
                    )
                }
            </div>
            <h3 className="relative mb-2"><Trans i18nKey="details.orderId" /> {order?.id}</h3>
        </div>
    );
};
