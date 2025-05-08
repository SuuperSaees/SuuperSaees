import { useEffect, useState } from 'react';
import { useStripeProducts } from './use-stripe';
import { Service } from '~/lib/services.types';

const useProducts = (stripeId?: string | null) => {
  const { products: stripeProducts, loading: loadingStripe } = useStripeProducts(stripeId!);
  const [products, setProducts] = useState<Service.Type[]>([]);

  useEffect(() => {
    if (stripeProducts) {
      setProducts([...stripeProducts]);
    }
  }, [stripeProducts]);

  return { products, loading: loadingStripe };
};

export {
    useProducts
};