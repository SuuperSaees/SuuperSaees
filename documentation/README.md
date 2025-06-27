# Makerkit - Supabase SaaS Starter Kit - Turbo Editions

This is a Starter Kit for building SaaS applications using Supabase, Next.js, and Tailwind CSS.

This version uses Turborepo to manage multiple packages in a single repository.

**This project is stable but still under development. Please update the repository daily**.

This repository is the demo version hosted on Cloudflare Pages. Please use the vanilla kit as starter - as this is used for testing all the features.

[Please follow the documentation to get started](https://makerkit.dev/docs/next-supabase-turbo/introduction).

# Stripe Integration

```mermaid
graph TD
    A[Suuper] --> B[Stripe API Integration]
    B --> C[Connected Accounts]
    C --> D[OAuth Flow]
    D --> E[Generate Stripe Account ID]
    E --> F[Automatic Onboarding]
    
    F --> G[Create Products and Services]
    G --> H[Generate Checkout]
    
    I[Payment Events] --> J[Automatic Webhook<br/>Management]
    J --> K[Suuper Webhook Endpoint]
    K --> L[Update Payment Status]
```

# Treli Integration

```mermaid
graph TD
    A[Suuper] --> B[Treli API Integration]
    B --> C[Agency Account]
    C --> D[Manual API Credentials Input]
    D --> E[Store API Credentials<br/>username & secret]
    E --> F[Create Products and Services]
    
    G[Agency Dashboard] --> H[Configure Webhook URL]
    H --> I[Store Webhook Configuration<br/>in Treli Dashboard]
    
    J[Payment Events] --> K[Webhook Notifications]
    K --> L[Suuper Webhook Endpoint]
    L --> M[Update Payment Status]
```


## Update service stripe

```mermaid
graph TD;
    A[Start] --> B[Get data in <strong>update-service.tsx</strong>]
    B --> C[Call updateService in update-service-server.tsx]
    subgraph "Update Process"
        direction TB
        style Update Process fill:#87CEEB,stroke:#333,stroke-width:4px
        C -->D[Update service in database]
        D -->E[GET price to obtain productId, Call /api/stripe/create-service-price]
        E --> F[Update new Price in Stripe]
        F --> G[Call /api/stripe/update-service]
        G --> H[Update service in Stripe]
    end
    H --> I[End]
```
Files: [update-service.tsx](./packages/features/team-accounts/src/server/actions/services/update/update-service.tsx)

## Stripe Billing Suuper

```mermaid
sequenceDiagram
    participant User
    participant Platform
    participant Stripe

    User->>Platform: Platform registration
    activate Platform
    Platform-->>User: Free plan assigned by default
    deactivate Platform

    User->>Platform: Access "Billing" in Settings
    activate Platform
    Platform-->>User: Shows current plan, invoices, plan upgrade option and card
    deactivate Platform

    User->>Platform: Selects new plan
    activate Platform
    Platform->>Stripe: Updates subscription with new plan and member count
    activate Stripe
    Stripe-->>Platform: Subscription update confirmation
    deactivate Stripe
    Platform-->>User: Plan updated
    deactivate Platform

    User->>Platform: Updates credit card
    activate Platform
    Platform->>Stripe: Updates payment method
    activate Stripe
    Stripe-->>Platform: Payment method update confirmation
    deactivate Stripe
    Platform-->>User: Card updated
    deactivate Platform

    Stripe->>User: Sends invoice adjusted by member count
```
## Email Confirmation Flow Implementation for Supabase with Amazon SES Integration

```mermaid
sequenceDiagram
    participant User
    participant Supabase
    participant Database
    participant AmazonSES

    User->>Supabase: Sign up with email and password
    Supabase-->>User: Obtain session object
    Supabase->>Database: Store accessToken, refreshToken, etc.
    Supabase->>AmazonSES: Configure email server
    AmazonSES-->>Supabase: Configuration confirmation
    Supabase->>AmazonSES: Send email to user
    AmazonSES-->>User: Email with URL and token id
    User->>Supabase: Confirmation with id from request
    Supabase->>Database: Search in the database
    Database-->>Supabase: If exists, retrieve accessToken and refreshToken
    Supabase-->>User: Set session
```

## Billing integration for agencies [Treli, Stripe]

```mermaid
graph TD
    A[Agency creates service] --> B{Has payment methods<br/>configured?}
    B -->|No| C[Save only in local DB]
    B -->|Yes| D[Sync with providers]
    D --> E[Stripe Sync]
    D --> F[Treli Sync]
    
    G[Webhook Provider] --> H{Event Type}
    H -->|Payment successful| I[Update payment status]
    H -->|Service update| J[Sync changes]
    
    K[Agency connects
    new provider] --> L[Sync existing services]
    L --> M[Create services in
    new provider]
```

# Payment Provider Integration: Treli vs Stripe

## Treli Integration

### Connection Model
- **Type**: Direct connection via API credentials
- **Process**: Manual
- **Required Credentials**:
  - Username
  - Production Secret Password
  - Location: https://treli.co/account/settings/api/

### Webhook Configuration
- **Type**: Manual configuration per agency
- **Process**:
  1. Each agency must access their Treli dashboard
  2. Navigate to: https://treli.co/account/settings/webhooks/
  3. Configure the URL provided by Suuper
  4. Activate all necessary events

### Limitations
- No parent/child account concept
- Manual configuration required per agency
- Individual webhook management

## Stripe Integration

### Connection Model
- **Type**: OAuth + Connected Accounts
- **Process**: Automated
- **Credentials**:
  - Automatic Stripe Account ID generation
  - Automatic access token management

### Webhook Configuration
- **Type**: Automatic through API
- **Process**:
  1. One-time platform-level configuration
  2. Webhooks automatically configured for all connected accounts
  3. Centralized event management

### Advantages
- Automated onboarding system
- Centralized connected account management
- Automatic webhook configuration

## Implementation Considerations

### For Treli
1. **Secure Credential Storage**
   - Encrypt API credentials
   - Implement secret rotation system

2. **Onboarding Process**
   - Create step-by-step guide for agencies
   - Implement credential validation
   - Verify webhook configuration

3. **Monitoring**
   - Implement webhook health checks
   - Connection failure alert system

### For Stripe
1. **OAuth Management**
   - Implement authorization flow
   - Handle token renewal

2. **Automation**
   - Leverage APIs for automatic configuration.
   - Implement bidirectional synchronization.

3. **Monitoring**
   - Use Stripe Dashboard for supervision.
   - Implement detailed event logging.
  

# Invoice Management System

## Automatic Invoice Creation via Stripe Webhooks

```mermaid
sequenceDiagram
    participant Stripe
    participant Webhook
    participant Database
    participant InvoiceService
    participant NotificationService

    Stripe->>Webhook: customer.subscription.created
    activate Webhook
    Webhook->>Database: Create client_subscriptions record
    Note over Database: Store billing_customer_id<br/>billing_subscription_id<br/>billing_provider: 'stripe'
    Database-->>Webhook: Subscription created
    deactivate Webhook

    Stripe->>Webhook: invoice.created
    activate Webhook
    Webhook->>Database: Query client_subscriptions by billing_customer_id
    Database-->>Webhook: Return client info
    Webhook->>InvoiceService: Create invoice with Stripe data
    activate InvoiceService
    InvoiceService->>Database: Insert into invoices table
    Note over Database: status: 'issued'<br/>provider_id: stripe_invoice_id<br/>checkout_url: stripe_hosted_url
    InvoiceService->>Database: Insert invoice_items
    InvoiceService->>Database: Insert activity record
    Database-->>InvoiceService: Invoice created
    InvoiceService->>NotificationService: Send invoice notification
    InvoiceService-->>Webhook: Invoice processed
    deactivate InvoiceService
    deactivate Webhook

    Stripe->>Webhook: invoice.payment_succeeded
    activate Webhook
    Webhook->>Database: Update invoice status to 'paid'
    Webhook->>Database: Insert invoice_payments record
    Note over Database: payment_method: 'stripe'<br/>status: 'completed'<br/>provider_payment_id
    Webhook->>Database: Insert activity record
    Database-->>Webhook: Payment recorded
    deactivate Webhook
```

## Manual Invoice Creation with Stripe Integration

```mermaid
sequenceDiagram
    participant Agency
    participant Platform
    participant Database
    participant StripeAPI
    participant Client

    Agency->>Platform: Create new invoice
    activate Platform
    Platform->>Database: Insert invoice (status: 'draft')
    Platform->>Database: Insert invoice_items
    Database-->>Platform: Invoice created
    Platform-->>Agency: Show invoice draft
    deactivate Platform

    Agency->>Platform: Issue invoice
    activate Platform
    Platform->>Database: Update invoice status to 'issued'
    
    alt Agency has Stripe connected
        Platform->>Database: Check if client has billing_customer_id
        alt Client has Stripe customer
            Platform->>StripeAPI: Create Stripe invoice
            activate StripeAPI
            StripeAPI-->>Platform: Return invoice with hosted URL
            deactivate StripeAPI
            Platform->>Database: Update provider_id and checkout_url
        else Client doesn't have Stripe customer
            Platform->>StripeAPI: Create Stripe customer
            activate StripeAPI
            StripeAPI-->>Platform: Return customer_id
            deactivate StripeAPI
            Platform->>Database: Update client billing_customer_id
            Platform->>StripeAPI: Create Stripe invoice
            activate StripeAPI
            StripeAPI-->>Platform: Return invoice with hosted URL
            deactivate StripeAPI
            Platform->>Database: Update provider_id and checkout_url
        end
    end
    
    Platform->>Database: Insert activity record
    Platform->>Client: Send invoice notification
    Platform-->>Agency: Invoice issued successfully
    deactivate Platform
```

## Manual Payment Recording

```mermaid
sequenceDiagram
    participant Agency
    participant Platform
    participant Database
    participant NotificationService

    Agency->>Platform: Record manual payment
    activate Platform
    Platform->>Database: Insert invoice_payments record
    Note over Database: payment_method: 'manual'/'bank_transfer'/'cash'<br/>status: 'completed'<br/>reference_number<br/>processed_by: agency_user_id
    
    Platform->>Database: Calculate total payments for invoice
    Database-->>Platform: Return payment total
    
    alt Full payment received
        Platform->>Database: Update invoice status to 'paid'
    else Partial payment received
        Platform->>Database: Update invoice status to 'partially_paid'
    end
    
    Platform->>Database: Insert activity record
    Platform->>NotificationService: Send payment confirmation
    Platform-->>Agency: Payment recorded successfully
    deactivate Platform
```

## Invoice Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft: Create invoice
    draft --> issued: Issue invoice
    draft --> cancelled: Cancel draft
    
    issued --> paid: Full payment received
    issued --> partially_paid: Partial payment received
    issued --> overdue: Due date passed
    issued --> cancelled: Cancel issued invoice
    
    partially_paid --> paid: Remaining payment received
    partially_paid --> overdue: Due date passed
    partially_paid --> cancelled: Cancel invoice
    
    overdue --> paid: Payment received
    overdue --> partially_paid: Partial payment received
    overdue --> cancelled: Cancel invoice
    
    paid --> voided: Void paid invoice
    cancelled --> [*]
    voided --> [*]
```

## Webhook Event Processing Flow

```mermaid
graph TD
    A[Stripe Webhook Event] --> B{Event Type}
    
    B -->|customer.subscription.created| C[Create client_subscriptions]
    B -->|customer.subscription.updated| D[Update client_subscriptions]
    B -->|customer.subscription.deleted| E[Mark subscription as deleted]
    
    B -->|invoice.created| F[Create invoice record]
    B -->|invoice.updated| G[Update invoice details]
    B -->|invoice.payment_succeeded| H[Record payment & update status]
    B -->|invoice.payment_failed| I[Record failed payment]
    
    C --> J[Store billing_customer_id<br/>billing_subscription_id]
    F --> K[Query client by billing_customer_id]
    K --> L[Create invoice with items]
    L --> M[Set status to 'issued']
    
    H --> N[Insert payment record]
    N --> O[Update invoice status to 'paid']
    O --> P[Create activity log]
    
    I --> Q[Insert failed payment record]
    Q --> R[Keep invoice status as 'issued']
    R --> S[Create activity log]
```

