# API Documentation - Suuper - Current Version v1

```mermaid
graph TD;
    A[Front-end Next.js] --> B[API Backend - TypeScript];
    B --> E[Middleware Autenticación y Seguridad];
    B --> C[Persistencia Supabase];
    B --> D[Servicios Externos SMTP, etc.];
    E --> C;
    E --> D;
```

```mermaid
sequenceDiagram
    title Flujo de Solicitud en Arquitectura Hexagonal

    participant Client as Front-end (Next.js)
    participant API as Backend API
    participant Middleware as Middleware de Seguridad
    participant DB as Persistencia (Supabase)
    participant Service as Servicio Externo (SMTP, etc.)

    Client->>API: Solicitud HTTP (con token Bearer)
    API->>Middleware: Verificación del Token Bearer
    Middleware->>DB: Validación del Token
    DB-->>Middleware: Respuesta de Validación
    Middleware-->>API: Token Validado
    API->>DB: Consulta/Actualización de Datos
    DB-->>API: Datos
    API->>Service: Envío de Correo (si aplica)
    Service-->>API: Confirmación de Envío de Correo
    API-->>Client: Respuesta HTTP
```

## Routes

## Secularization

## Webhook

```mermaid
graph TD;
    A[Inicio] --> B[Usuario selecciona un plan]
    B --> C{Usuario paga el plan Standard, Premium, Enterprise ¿Usuario tiene token válido?}
    C -- Sí --> D[Stripe envía webhook a Suuper] 
    C -- No --> E[Redirigir a landing page]

    D --> F[Generar token encriptado]
    F --> H[Almacenar token en la tabla]

    H --> I[Enviar token al usuario mediante Nodemailer]

    I --> J{¿Usuario se registra?}
    J -- Sí --> L[Verificar validez del token]
    J -- No --> M[Token sigue almacenado]

    L --> N{¿Token válido?}
    N -- Sí --> O[Acceso permitido]
    N -- No --> P[Redirigir a landing page]

    style A fill:#f9f,stroke:#333,stroke-width:2px;
    style B fill:#bbf,stroke:#333,stroke-width:2px;
    style C fill:#bbf,stroke:#333,stroke-width:2px;
    style D fill:#bbf,stroke:#333,stroke-width:2px;
    style E fill:#fbb,stroke:#333,stroke-width:2px;
    style F fill:#bbf,stroke:#333,stroke-width:2px;
    style H fill:#bbf,stroke:#333,stroke-width:2px;
    style I fill:#bbf,stroke:#333,stroke-width:2px;
    style J fill:#bbf,stroke:#333,stroke-width:2px;
    style L fill:#bbf,stroke:#333,stroke-width:2px;
    style M fill:#bbf,stroke:#333,stroke-width:2px;
    style N fill:#bbf,stroke:#333,stroke-width:2px;
    style O fill:#bbf,stroke:#333,stroke-width:2px;
    style P fill:#bbf,stroke:#333,stroke-width:2px;

    classDef blackText fill:#fff, color:#000;
    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q blackText;
```