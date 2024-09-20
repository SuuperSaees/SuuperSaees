import stripe
import json
from datetime import datetime

GREEN = "\033[92m"  
RED = "\033[91m"    
RESET = "\033[0m"

# Config
# stripe.api_key = "your_api_key_stripe_test!"  
stripe.api_key = "your_api_key_stripe_test!"  
# emails_without_customer = {"example@example.co": None, "example+a111@example.com": None}  
emails_without_customer = {}  
# price_id = "your_price_id_test"  
price_id = "your_price_id_test!"  

# List to save with SQL code
subscriptions_sql = []

# Function to create clients
def create_customers_y_subscriptions(emails):
    for email, proprietary_org_id in emails.items():
        # Create client in Stripe
        print(f"Creating customer for email: {email}")
        customer = stripe.Customer.create(email=email)
        customer_id = customer.id
        
        # Create starter subscription
        print(f"Creating subscription for customer: {customer_id}")
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
        )
        
        # Capture the necessary data for the SQL insertion
        subscription_data = {
            "account_id": None,  
            "active": subscription['status'] == 'active',
            "billing_customer_id": customer_id,
            "billing_provider": "stripe",  
            "cancel_at_period_end": False,
            "created_at": datetime.fromtimestamp(subscription['created']).isoformat(),
            "currency": "usd",
            "id": subscription.id,
            "period_ends_at": datetime.fromtimestamp(subscription['current_period_end']).isoformat(),
            "period_starts_at": datetime.fromtimestamp(subscription['current_period_start']).isoformat(),
            "propietary_organization_id": proprietary_org_id, 
            "status": "active",
            "trial_ends_at": None,  
            "trial_starts_at": None, 
            "updated_at": None,
        }
        
        # Generate the insertion line SQL
        # Generar la línea de inserción SQL
        sql_insert = f"""
        INSERT INTO subscriptions (
            account_id, active, billing_customer_id, billing_provider,
            cancel_at_period_end, created_at, currency, id,
            period_ends_at, period_starts_at, propietary_organization_id,
            status, trial_ends_at, trial_starts_at, updated_at
        ) VALUES (
            {subscription_data['account_id'] if subscription_data['account_id'] is not None else 'NULL'}, 
            {subscription_data['active']}, 
            '{subscription_data['billing_customer_id']}',
            '{subscription_data['billing_provider']}', 
            {subscription_data['cancel_at_period_end']}, 
            '{subscription_data['created_at']}', 
            '{subscription_data['currency']}', 
            '{subscription_data['id']}',
            '{subscription_data['period_ends_at']}', 
            '{subscription_data['period_starts_at']}', 
            '{subscription_data['propietary_organization_id'] if subscription_data['propietary_organization_id'] is not None else 'NULL'}', 
            '{subscription_data['status']}', 
            {subscription_data['trial_ends_at'] if subscription_data['trial_ends_at'] is not None else 'NULL'}, 
            {subscription_data['trial_starts_at'] if subscription_data['trial_starts_at'] is not None else 'NULL'}, 
            {subscription_data['updated_at'] if subscription_data['updated_at'] is not None else 'NULL'}
        );
        """

        subscriptions_sql.append(sql_insert)

# Call the function
create_customers_y_subscriptions(emails_without_customer)

# Save the SQL file
with open("subscriptions.sql", "w") as file:
    for line in subscriptions_sql:
        file.write(line + "\n")

print(f"{GREEN}Process completed. SQL file generated: subscriptions.sql{RESET}")