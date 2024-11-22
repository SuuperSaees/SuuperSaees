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
   - Leverage APIs for automatic configuration
   - Implement bidirectional synchronization

3. **Monitoring**
   - Use Stripe Dashboard for supervision
   - Implement detailed event logging