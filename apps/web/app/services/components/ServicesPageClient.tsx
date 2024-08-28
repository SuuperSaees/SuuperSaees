// "use client";

// import { PageBody } from '@kit/ui/page';
// import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
// import { Button } from '@kit/ui/button';
// import { BellIcon } from 'lucide-react';
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
// import { useEffect, useState } from 'react';

// if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
//   throw new Error("Stripe public key is not defined in environment variables");
// }

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// async function fetchStripeProducts(accountId: string) {
//     const response = await fetch(`/api/stripe/get-products?accountId=${encodeURIComponent(accountId)}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
  
//     if (!response.ok) {
//       throw new Error('Failed to fetch products from Stripe');
//     }
  
//     const data = await response.json();
//     console.log(data);
//     return data;
//   }

// interface ServicesPageClientProps {
//   accountId: string;
//   accountIds: string[];
//   stripeId: string;
// }

// const ServicesPageClient: React.FC<ServicesPageClientProps> = ({ accountId, accountIds, stripeId}) => {
//   const [products, setProducts] = useState<any>(null);

//   useEffect(() => {
//     async function loadProducts() {
//       const products = await fetchStripeProducts(stripeId);
//       setProducts(products);
//     }
//     loadProducts();
//   }, [stripeId]);

//   return (
//     <Elements stripe={stripePromise}>
//       <PageBody>
//         <div className='p-[35px]'>
//           <div className="flex justify-between items-center mb-[32px]">
//             <div className="flex-grow">
//               <span>
//                 <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
//                   Servicios
//                 </div>
//               </span>
//             </div>
//             <div className="flex space-x-4">
//               <span>
//                 <Button variant="outline">
//                   Tu prueba gratuita termina en xx dias
//                 </Button>
//               </span>
//               <span>
//                 <Button variant="outline" size="icon">
//                   <BellIcon className="h-4 w-4" />
//                 </Button>
//               </span>
//             </div>
//           </div>
//           {products ? (
//             <ServicesTable services={products} accountIds={accountIds} accountNames={[]} />
//           ) : (
//             <></>
//           )}
//         </div>
//       </PageBody>
//     </Elements>
//   );
// };

// export default ServicesPageClient;

"use client";

import { PageBody } from '@kit/ui/page';
import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { Button } from '@kit/ui/button';
import { BellIcon } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
// import { Service } from '../../../../../../apps/web/lib/services.types';
import { Service } from '~/lib/services.types';
// import type { TFunction } from "../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

async function fetchStripeProducts(accountId: string) {
  if (!accountId) return
    const response = await fetch(`/api/stripe/get-products?accountId=${encodeURIComponent(accountId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch products from Stripe');
    }
  
    const data = await response.json();
    return data;
}

async function fetchStripePrices(accountId: string) {
  if (!accountId) return
    const response = await fetch(`/api/stripe/get-prices?accountId=${encodeURIComponent(accountId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch prices from Stripe');
    }
  
    const data = await response.json();
    return data;
}

function transformProduct(product: any, prices: any[]): Service.Type {
    const price = prices.find((price) => price.product === product.id);
  return {
    allowed_orders: null, // Asumiendo que no hay esta propiedad en los datos de Stripe
    created_at: new Date(product.created * 1000).toISOString(), // Convertir timestamp a fecha ISO
    credit_based: false, // Suponiendo un valor por defecto
    credits: null,
    hours: null,
    id: parseInt(product.id.replace('prod_', '')), // Convertir id al formato requerido
    max_number_of_monthly_orders: null,
    max_number_of_simultaneous_orders: null,
    name: product.name,
    number_of_clients: null,
    price: price ? price.unit_amount / 100 : null, // Necesitarías obtener el precio por separado si es necesario
    propietary_organization_id: null,
    purchase_limit: 0, // Valor por defecto
    recurrence: null,
    recurring_subscription: false, // Valor por defecto
    service_description: product.description,
    service_image: product.images?.[0] || null, // Usar la primera imagen si existe
    single_sale: false, // Valor por defecto
    standard: true, // Valor por defecto
    status: product.active ? 'active' : 'inactive', // Ejemplo de conversión
    test_period: false, // Valor por defecto
    test_period_duration: null,
    test_period_duration_unit_of_measurement: null,
    test_period_price: null,
    time_based: false, // Valor por defecto
  };
}

interface ServicesPageClientProps {
  accountId: string;
  accountIds: string[];
  stripeId: string;
}

const ServicesPageClient: React.FC<ServicesPageClientProps> = ({ accountId, accountIds, stripeId }) => {
  const [products, setProducts] = useState<Service.Type[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProductsAndPrices() {
      try {
        const [productsResponse, pricesResponse] = await Promise.all([
          fetchStripeProducts(stripeId),
          fetchStripePrices(stripeId)
        ]);
        
        const transformedProducts = productsResponse.data.map((product: any) => transformProduct(product, pricesResponse.data));
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products or prices:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProductsAndPrices();
  }, [stripeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <Elements stripe={stripePromise}>
      <PageBody>
        <div className='p-[35px]'>
          <div className="flex justify-between items-center mb-[32px]">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                  Servicios
                </div>
              </span>
            </div>
            <div className="flex space-x-4">
              <span>
                <Button variant="outline">
                  Tu prueba gratuita termina en xx días
                </Button>
              </span>
              <span>
                <Button variant="outline" size="icon">
                  <BellIcon className="h-4 w-4" />
                </Button>
              </span>
            </div>
          </div>
          <ServicesTable services={products} accountIds={accountIds} accountNames={[]} />
        </div>
      </PageBody>
    </Elements>
  );
};

export default ServicesPageClient;
