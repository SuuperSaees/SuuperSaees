import React, { useEffect, useState } from "react";
import CheckoutPage from "./checkout-page"; 
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@kit/ui/button";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const PlansPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null); 

  useEffect(() => {
    setLoading(true);
    fetch("/api/stripe/suuper-products", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products: ", error);
        setErrorMessage("Error loading products");
        setLoading(false);
      });
  }, []);

  const handleCheckout = (amount: number) => {
    const real_amount = amount / 100; 
    setSelectedAmount(real_amount); 
  };

  if (loading) {
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

  if (errorMessage) {
    return <div className="text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="items-center justify-center flex flex-col mt-10 w-full">
      <h2 className="text-xl font-bold mb-4">Available Plans</h2>
      {products.length === 0 ? (
        <div>No products available.</div>
      ) : (
        <ul className="flex justify-center space-x-4">
          {products.map((product) => (
            <li key={product.id} className="w-full">
              <div className="bg-gray-100 p-4 rounded-lg items-center justify-center flex flex-col">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="items-center justify-center mx-10">{product.description}</p>
                <p className="font-bold">
                  Price: ${(product.unit_amount / 100).toFixed(2)} USD
                </p>
                <Button
                  className="mt-2 p-2 bg-blue-500 text-white rounded"
                  onClick={() => handleCheckout(product.unit_amount)}
                >
                  Buy Now
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedAmount !== null && (
        <div>
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: selectedAmount,
              currency: "usd",
            }}
          >
            <CheckoutPage amount={selectedAmount} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default PlansPage;