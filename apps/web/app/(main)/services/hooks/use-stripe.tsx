'use client';


import { useState, useEffect } from 'react';
import { Service } from '~/lib/services.types';
// import { Database } from '~/lib/database.types';



export type StripeProductResponse = {
    data: StripeProduct[];
}

export type StripeProduct = {
    id: string;
    object: string;
    active: boolean;
    attributes: unknown[];
    created: number;
    default_price: string | null; 
    description: string;
    images: string[]; 
    livemode: boolean;
    marketing_features: unknown[]; 
    metadata: Record<string, unknown>;
    name: string;
    package_dimensions: null; 
    shippable: null; 
    statement_descriptor: null; 
    tax_code: null; 
    type: string;
    unit_label: null; 
    updated: number;
    url: string | null; 
};

export type StripePriceResponse = {
    data: StripePrice[];
}

export type StripePrice = {
        id: string;
        object: string;
        active: boolean;
        billing_scheme: string;
        created: number;
        currency: string;
        custom_unit_amount: null; 
        livemode: boolean;
        lookup_key: string | null;
        metadata: Record<string, unknown>;
        nickname: string | null;
        product: string;
        recurring: {
            aggregate_usage: null,
            interval: "month",
            interval_count: 1,
            trial_period_days: null,
            usage_type: "licensed"
        },
        tax_behavior: string;
        tiers_mode: string | null;
        transform_quantity: null; 
        type: string;
        unit_amount: number;
        unit_amount_decimal: string;
};

async function fetchStripeProducts(accountId: string) {
    const response = await fetch(`/api/stripe/get-products?accountId=${encodeURIComponent(accountId)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch products from Stripe');
    }

    const data: StripeProductResponse = await response.clone().json();
    return data;
}

async function fetchStripePrices(accountId: string) {
    const response = await fetch(`/api/stripe/get-prices?accountId=${encodeURIComponent(accountId)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch prices from Stripe');
    }

    const data: StripePriceResponse = await response.clone().json();
    return data;
}

function transformProduct(product: StripeProduct, prices: StripePrice[]): Service.Type {
    const price = prices.find((price) => price.product === product.id);
    return {
        allowed_orders: null,
        created_at: new Date(product.created * 1000).toISOString(),
        credit_based: false,
        credits: null,
        hours: null,
        id: parseInt(product.id.replace('prod_', '')),
        max_number_of_monthly_orders: null,
        max_number_of_simultaneous_orders: null,
        name: product.name,
        number_of_clients: null,
        price: price ? price.unit_amount / 100 : 0,
        price_id: price ? price.id : null,
        propietary_organization_id: "",
        purchase_limit: 0,
        recurrence: null,
        recurring_subscription: false,
        service_description: product.description,
        service_image: product.images?.[0] ?? null,
        single_sale: false,
        standard: true,
        status: product.active ? 'active' : 'inactive',
        test_period: false,
        test_period_duration: null,
        test_period_duration_unit_of_measurement: null,
        test_period_price: null,
        time_based: false,
    };
}

export function useStripeProducts(stripeId: string) {
    const [products, setProducts] = useState<Service.Type[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProductsAndPrices() {
            try {
                const [productsResponse, pricesResponse] = await Promise.all([
                    fetchStripeProducts(stripeId),
                    fetchStripePrices(stripeId)
                ]);

                const transformedProducts = productsResponse.data.map((product: StripeProduct) => transformProduct(product, pricesResponse.data));
                setProducts(transformedProducts);
            } catch (error) {
                console.error("Error fetching products or prices:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProductsAndPrices().catch((error) => console.error("Error loading products and prices:", error));
        
    }, [stripeId]);

    return { products, loading };
}