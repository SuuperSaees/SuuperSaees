# Makerkit - Supabase SaaS Starter Kit - Turbo Edition

This is a Starter Kit for building SaaS applications using Supabase, Next.js, and Tailwind CSS.

This version uses Turborepo to manage multiple packages in a single repository.

**This project is stable but still under development. Please update the repository daily**.

This repository is the demo version hosted on Cloudflare Pages. Please use the vanilla kit as starter - as this is used for testing all the features.

[Please follow the documentation to get started](https://makerkit.dev/docs/next-supabase-turbo/introduction).

# Stripe Integration

```mermaid
graph TD;
    A[Suuper] --> B[Stripe API Integration];
    B --> C[Connected Companies];
    C --> D[Generate Stripe Account ID];
    D --> E{Is Onboarding Completed?};
    E -- No --> F[Allow Creation and Configuration on the Platform];
    E -- Yes --> G[Create Products and Services on the Platform];
    F --> G;
    D --> H[Store Stripe Account ID in Database];
    H --> G;
    G --> I[View Invoices];
    G --> L[List Prices and products]
    G --> J[Generate Checkout];
    I --> K[Connected Companies' Customers];
    J --> K;
    L --> K;
```

## Update service stripe

```mermaid
graph TD;
    A[Inicio] --> B[Obtención de los datos en <strong>update-service.tsx</strong>]
    B --> C[Llamada a updateService en update-service-server.tsx]
    subgraph "Actualización"
        direction TB
        style Actualización fill:#6A5ACD,stroke:#333,stroke-width:4px
        C -->D[Actualizar servicio en la base de datos]
        D -->E[GET de price para obtener el productId, Llamada a /api/stripe/create-service-price]
        E --> F[Actualización del nuevo Price en Stripe]
        F --> G[Llamada a /api/stripe/update-service]
        G --> H[Actualización del servicio en Stripe]
    end
    H --> I[Fin]
```
Files: [update-service.tsx](./packages/features/team-accounts/src/server/actions/services/update/update-service.tsx)