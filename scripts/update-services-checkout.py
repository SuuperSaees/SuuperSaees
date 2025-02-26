import os
from supabase import create_client, Client
import json
from datetime import datetime, timedelta
import asyncio
from typing import Dict, Any
import uuid
import base64
import hmac
import hashlib

# Colores para la consola
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

# Configuración de Supabase
SUPABASE_URL = ""
SUPABASE_SERVICE_ROLE_KEY = ""
IS_PROD = os.getenv("NEXT_PUBLIC_IS_PROD", "false").lower() == "true"

# Inicializar cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async def get_organization(primary_owner_id: str) -> Dict:
    try:
        # Obtener organization_id del usuario
        user_account = supabase.table('accounts').select(
            'organization_id'
        ).eq('id', primary_owner_id).single().execute()

        if not user_account.data or not user_account.data.get('organization_id'):
            raise ValueError(f"No organization found for user {primary_owner_id}")

        organization_id = user_account.data['organization_id']

        # Obtener datos de la organización
        organization = supabase.table('accounts').select(
            'id, name, primary_owner_user_id, slug, email, picture_url, loom_app_id'
        ).eq('id', organization_id).single().execute()

        if not organization.data:
            raise ValueError(f"No organization data found for id {organization_id}")

        return organization.data

    except Exception as e:
        print(f"{RED}Error getting organization: {str(e)}{RESET}")
        raise e

async def get_domain_by_organization_id(organization_id: str) -> str:
    try:
        response = supabase.table('organization_subdomains').select(
            'subdomains(domain)'
        ).eq('organization_id', organization_id).single().execute()

        if response.data:
            subdomains = response.data.get('subdomains')
            if isinstance(subdomains, list):
                domain = subdomains[0].get('domain')
            else:
                domain = subdomains.get('domain')
                
            if domain:
                return f"{'https' if IS_PROD else 'http'}://{domain}/"
                
        return os.getenv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000/')
        
    except Exception as e:
        print(f"{RED}Error getting domain for organization {organization_id}: {str(e)}{RESET}")
        return os.getenv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000/')

async def generate_checkout_url(service: Dict[str, Any]) -> str:
    try:
        owner_id = service.get('propietary_organization_id')
        if not owner_id:
            raise ValueError(f"No owner_id found for service {service.get('id')}")

        # Obtener organización
        organization = await get_organization(owner_id)
        
        # Obtener stripe_id
        stripe_account = supabase.table('billing_accounts').select('*').eq('account_id', owner_id).execute()
        stripe_id = stripe_account.data[0].get('stripe_id') if stripe_account.data else None

        # Obtener base_url para este servicio específico
        base_url = await get_domain_by_organization_id(organization['id'])

        # Generar token siguiendo la lógica de TypeScript
        header = {
            "alg": "HS256",
            "typ": "JWT"
        }
        
        now = datetime.now()
        expires_at = now + timedelta(hours=1)  # 1 hour expiration

        token_payload = {
            "account_id": stripe_id or "",
            "price_id": "",
            "service": service,
            "expires_at": expires_at.isoformat(),
            "organization_id": organization['id'],
            "payment_methods": [],
            "primary_owner_id": owner_id
        }

        # Generar tokens siguiendo la lógica de TypeScript
        base64_header = base64.b64encode(json.dumps(header).encode()).decode()
        base64_payload = base64.b64encode(json.dumps(token_payload).encode()).decode()
        
        # Generar firma
        jwt_secret = ''
            
        signature = base64.b64encode(
            hmac.new(
                jwt_secret.encode(),
                f"{base64_header}.{base64_payload}".encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        access_token = f"{base64_header}.{base64_payload}.{signature}"
        refresh_token = base64.b64encode(f"{str(uuid.uuid4())}suuper".encode()).decode()
        id_token_provider = f"{str(uuid.uuid4())}suuper"

        # Insertar token
        token_data = {
            "access_token": access_token,
            "created_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "id_token_provider": id_token_provider,
            "provider": "suuper",
            "refresh_token": refresh_token,
            "updated_at": now.isoformat()
        }

        token_response = supabase.table('tokens').insert(token_data).execute()

        return f"{base_url}checkout?tokenId={id_token_provider}"

    except Exception as e:
        print(f"{RED}Error generating checkout URL for service {service.get('id')}: {str(e)}{RESET}")
        return ""

async def main():
    try:
        # Obtener todos los servicios sin checkout_url
        response = supabase.table('services').select('*').is_('checkout_url', 'null').execute()
        services = response.data

        if not services:
            print(f"{GREEN}No services found without checkout_url{RESET}")
            return

        print(f"Found {len(services)} services without checkout_url")

        # Generar SQL updates
        sql_updates = []

        for service in services:
            checkout_url = await generate_checkout_url(service)
            if checkout_url:
                sql_updates.append(
                    f"UPDATE services SET checkout_url = '{checkout_url}' WHERE id = '{service['id']}';"
                )

        # Guardar SQL en archivo
        with open("update_checkout_urls.sql", "w") as f:
            f.write("\n".join(sql_updates))

        print(f"{GREEN}Generated SQL file with {len(sql_updates)} updates{RESET}")

    except Exception as e:
        print(f"{RED}Error: {str(e)}{RESET}")

if __name__ == "__main__":
    asyncio.run(main())