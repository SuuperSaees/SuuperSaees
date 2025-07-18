-- Migration: Create credit operations for existing orders before credits system
-- Date: 2025-07-17
-- Purpose: Migrate existing orders to the new credits system by creating their credit operations

-- Function to migrate existing orders to credits system
CREATE OR REPLACE FUNCTION migrate_existing_orders_to_credits()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    order_record RECORD;
    target_credit_id uuid;
    target_credit_operation_id uuid;
    migrated_count integer := 0;
    skipped_count integer := 0;
    error_count integer := 0;
BEGIN
    RAISE NOTICE 'Starting migration of existing orders to credits system...';
    
    -- Loop through all existing orders that meet the condition
    FOR order_record IN 
        SELECT 
            o.id,
            o.uuid,
            o.agency_id,
            o.client_organization_id,
            o.customer_id,
            o.title,
            o.created_at,
            o.credit_operation_id,
            ao.name as agency_name,
            co.name as client_name
        FROM public.orders_v2 o
        LEFT JOIN public.organizations ao ON ao.id = o.agency_id
        LEFT JOIN public.organizations co ON co.id = o.client_organization_id
        WHERE o.client_organization_id IS NOT NULL 
        AND o.client_organization_id != o.agency_id
        AND o.credit_operation_id IS NULL  -- Only process orders without credit operations
        AND o.deleted_on IS NULL
        ORDER BY o.created_at ASC
    LOOP
        BEGIN
            RAISE NOTICE 'Processing order ID: %, Title: %, Agency: %, Client: %', 
                order_record.uuid, 
                order_record.title, 
                order_record.agency_name,
                order_record.client_name;
            
            -- Get the credit_id for this client organization
            SELECT id INTO target_credit_id
            FROM public.credits 
            WHERE client_organization_id = order_record.client_organization_id 
            AND agency_id = order_record.agency_id
            AND deleted_on IS NULL
            LIMIT 1;
            
            -- If no credits record exists, create one
            IF target_credit_id IS NULL THEN
                INSERT INTO public.credits (
                    agency_id,
                    client_organization_id,
                    balance,
                    expired,
                    purchased,
                    refunded,
                    consumed,
                    locked,
                    user_id,
                    created_at,
                    updated_at
                ) VALUES (
                    order_record.agency_id,
                    order_record.client_organization_id,
                    0,  -- Starting balance
                    0,  -- No expired credits initially
                    0,  -- No purchased credits initially
                    0,  -- No refunded credits initially
                    0,  -- No consumed credits initially
                    0,  -- No locked credits initially
                    order_record.customer_id,  -- Use order customer as user
                    order_record.created_at,   -- Use order creation date
                    NOW()
                ) RETURNING id INTO target_credit_id;
                
                RAISE NOTICE 'Created credits record for client organization: %', order_record.client_name;
            ELSE
                RAISE NOTICE 'Using existing credits record for client organization: %', order_record.client_name;
            END IF;
            
            -- Now create the credit operation
            INSERT INTO public.credit_operations (
                actor_id,
                status,
                type,
                quantity,
                description,
                credit_id,
                metadata,
                remaining,
                created_at,
                updated_at
            ) VALUES (
                order_record.customer_id,
                'consumed',
                'user',
                0,  -- Default quantity for existing orders
                'Legacy order credit consumption (migrated)',
                target_credit_id,
                jsonb_build_object(
                    'order_title', order_record.title,
                    'order_uuid', order_record.uuid,
                    'created_by', order_record.customer_id,
                    'migrated', true,
                    'migration_date', NOW()
                ),
                0,  -- Starting remaining balance
                order_record.created_at,  -- Use order creation date
                NOW()
            ) RETURNING id INTO target_credit_operation_id;
            
            -- Update the order with the credit_operation_id
            UPDATE public.orders_v2 
            SET credit_operation_id = target_credit_operation_id,
                updated_at = NOW()
            WHERE id = order_record.id;
            
            migrated_count := migrated_count + 1;
            RAISE NOTICE 'Created credit operation for order %. Total migrated: %', 
                order_record.title, migrated_count;

        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE WARNING 'Error processing order ID %, Title %. Error: %. Total errors: %', 
                    order_record.uuid, 
                    order_record.title, 
                    SQLERRM, 
                    error_count;
                -- Continue with next order
        END;
    END LOOP;

    -- Count skipped orders (those that don't meet the condition)
    SELECT COUNT(*) INTO skipped_count
    FROM public.orders_v2 o
    WHERE o.deleted_on IS NULL
    AND (
        o.client_organization_id IS NULL 
        OR o.client_organization_id = o.agency_id
        OR o.credit_operation_id IS NOT NULL
    );

    -- Final summary
    RAISE NOTICE '=== MIGRATION COMPLETED ===';
    RAISE NOTICE 'Total orders migrated: %', migrated_count;
    RAISE NOTICE 'Total orders skipped: %', skipped_count;
    RAISE NOTICE 'Total errors encountered: %', error_count;
    RAISE NOTICE 'Migration finished successfully!';
    
END;
$$;

-- Execute the migration
DO $$
BEGIN
    RAISE NOTICE 'Starting credits system migration for existing orders...';
    PERFORM migrate_existing_orders_to_credits();
    RAISE NOTICE 'Credits system migration for orders completed!';
END;
$$;

-- Drop the temporary function after migration
DROP FUNCTION IF EXISTS migrate_existing_orders_to_credits();

-- Verify migration results
DO $$
DECLARE
    total_orders integer;
    orders_with_credits integer;
    eligible_orders integer;
    orders_without_credits integer;
BEGIN
    -- Count total active orders
    SELECT COUNT(*) INTO total_orders
    FROM public.orders_v2 
    WHERE deleted_on IS NULL;
    
    -- Count orders that should have credit operations (eligible orders)
    SELECT COUNT(*) INTO eligible_orders
    FROM public.orders_v2 o
    WHERE o.deleted_on IS NULL
    AND o.client_organization_id IS NOT NULL 
    AND o.client_organization_id != o.agency_id;
    
    -- Count orders with credit operations
    SELECT COUNT(*) INTO orders_with_credits
    FROM public.orders_v2 o
    WHERE o.deleted_on IS NULL
    AND o.credit_operation_id IS NOT NULL;
    
    -- Count eligible orders without credit operations (should ideally be 0 after migration)
    SELECT COUNT(*) INTO orders_without_credits
    FROM public.orders_v2 o
    WHERE o.deleted_on IS NULL
    AND o.client_organization_id IS NOT NULL 
    AND o.client_organization_id != o.agency_id
    AND o.credit_operation_id IS NULL;
    
    RAISE NOTICE '=== MIGRATION VERIFICATION ===';
    RAISE NOTICE 'Total active orders: %', total_orders;
    RAISE NOTICE 'Eligible orders (client_org != agency): %', eligible_orders;
    RAISE NOTICE 'Orders with credit operations: %', orders_with_credits;
    RAISE NOTICE 'Eligible orders without credit operations: %', orders_without_credits;
END;
$$;
