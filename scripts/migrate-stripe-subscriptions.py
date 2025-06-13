import os
import stripe
import json
from datetime import datetime
from supabase import create_client, Client
from typing import Dict, List, Optional, Any
import asyncio
from tqdm import tqdm

# Colores para la consola
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

# Configuración
SUPABASE_URL = "your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key"
STRIPE_SECRET_KEY = "your_stripe_secret_key"

# Configurar Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Inicializar cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Contadores globales
stats = {
    'processed_agencies': 0,
    'successful_syncs': 0,
    'failed_syncs': 0,
    'created_subscriptions': 0,
    'updated_subscriptions': 0,
    'missing_emails': []
}

def log_success(message: str):
    print(f"{GREEN}✓ {message}{RESET}")

def log_error(message: str):
    print(f"{RED}✗ {message}{RESET}")

def log_warning(message: str):
    print(f"{YELLOW}⚠ {message}{RESET}")

def log_info(message: str):
    print(f"{BLUE}ℹ {message}{RESET}")

async def get_billing_accounts_stripe() -> List[Dict[str, Any]]:
    """Obtener todas las billing accounts de tipo Stripe"""
    try:
        response = supabase.table('billing_accounts').select(
            'provider_id, account_id, accounts(id, email, name)'
        ).eq('provider', 'stripe').execute()
        
        if response.data:
            log_success(f"Encontradas {len(response.data)} cuentas de Stripe")
            return response.data
        else:
            log_warning("No se encontraron cuentas de Stripe")
            return []
    except Exception as e:
        log_error(f"Error obteniendo billing accounts: {str(e)}")
        return []

async def get_stripe_subscriptions(stripe_account_id: str) -> List[Dict[str, Any]]:
    """Obtener suscripciones activas de una cuenta conectada de Stripe"""
    try:
        subscriptions = stripe.Subscription.list(
            status='all',
            stripe_account=stripe_account_id,
            limit=100
        )
        
        active_subscriptions = [
            sub for sub in subscriptions.data 
            if sub.status in ['active', 'trialing', 'past_due']
        ]
        
        log_info(f"Encontradas {len(active_subscriptions)} suscripciones activas en cuenta {stripe_account_id}")
        return active_subscriptions
        
    except Exception as e:
        log_error(f"Error obteniendo suscripciones de Stripe para cuenta {stripe_account_id}: {str(e)}")
        return []

async def get_customer_email(customer_id: str, stripe_account_id: str) -> Optional[str]:
    """Obtener email del customer desde Stripe"""
    try:
        customer = stripe.Customer.retrieve(
            customer_id,
            stripe_account=stripe_account_id
        )
        return customer.email
    except Exception as e:
        log_error(f"Error obteniendo email del customer {customer_id}: {str(e)}")
        return None

async def find_client_by_email(email: str, agency_id: str) -> Optional[Dict[str, Any]]:
    """Buscar cliente en la base de datos por email"""
    try:
        # Buscar en accounts con el email
        account_response = supabase.table('accounts').select(
            'id, email'
        ).eq('email', email).single().execute()
        
        if account_response.data:
            user_id = account_response.data['id']
            
            # Buscar cliente asociado a esta agencia
            client_response = supabase.table('clients').select(
                'id, user_client_id, organization_client_id'
            ).eq('agency_id', agency_id).eq('user_client_id', user_id).single().execute()
            
            if client_response.data:
                return client_response.data
                
    except Exception as e:
        if "PGRST116" not in str(e):  # No encontrado
            log_error(f"Error buscando cliente por email {email}: {str(e)}")
    
    return None

async def check_existing_subscription(billing_customer_id: str) -> Optional[str]:
    """Verificar si ya existe una suscripción para este customer"""
    try:
        response = supabase.table('client_subscriptions').select(
            'id'
        ).eq('billing_customer_id', billing_customer_id).eq('billing_provider', 'stripe').single().execute()
        
        if response.data:
            return response.data['id']
    except Exception as e:
        if "PGRST116" not in str(e):
            log_error(f"Error verificando suscripción existente: {str(e)}")
    
    return None

async def create_client_subscription(client_id: str, subscription: Any, customer_email: str) -> bool:
    """Crear nueva client subscription"""
    try:
        log_info(f"Creando suscripción para cliente {client_id} - Email: {customer_email}, ID: {subscription.id}, Status: {subscription.status}")
        subscription_data = {
            'client_id': client_id,
            'billing_subscription_id': subscription.id,
            'billing_customer_id': subscription.customer,
            'billing_provider': 'stripe',
            'period_starts_at': datetime.fromtimestamp(subscription['items']['data'][0]['current_period_start']).isoformat() if subscription['items']['data'][0]['current_period_start'] else None,
            'period_ends_at': datetime.fromtimestamp(subscription['items']['data'][0]['current_period_end']).isoformat() if subscription['items']['data'][0]['current_period_end'] else None,
            'trial_starts_at': datetime.fromtimestamp(subscription['items']['data'][0]['trial_start']).isoformat() if subscription.status in ['trialing'] else None,
            'trial_ends_at': datetime.fromtimestamp(subscription['items']['data'][0]['trial_end']).isoformat() if subscription.status in ['trialing'] else None,
            'currency': subscription.currency,
            'status': subscription.status,
            'active': subscription.status in ['active', 'trialing'],
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        response = supabase.table('client_subscriptions').insert(subscription_data).execute()
        
        if response.data:
            log_success(f"Suscripción creada para cliente {client_id} - Email: {customer_email}")
            stats['created_subscriptions'] += 1
            return True
        else:
            log_error(f"Error creando suscripción para {customer_email}")
            return False
            
    except Exception as e:
        log_error(f"Error creando client subscription para {customer_email}: {str(e)}")
        return False

async def update_client_subscription(subscription_id: str, subscription: Any, customer_email: str) -> bool:
    """Actualizar suscripción existente"""
    try:
        update_data = {
            'billing_subscription_id': subscription.id,
            'period_starts_at': datetime.fromtimestamp(subscription['items']['data'][0]['current_period_start']).isoformat() if subscription['items']['data'][0]['current_period_start'] else None,
            'period_ends_at': datetime.fromtimestamp(subscription['items']['data'][0]['current_period_end']).isoformat() if subscription['items']['data'][0]['current_period_end'] else None,
            'trial_starts_at': datetime.fromtimestamp(subscription['items']['data'][0]['trial_start']).isoformat() if subscription.status in ['trialing'] else None,
            'trial_ends_at': datetime.fromtimestamp(subscription['items']['data'][0]['trial_end']).isoformat() if subscription.status in ['trialing'] else None,
            'status': subscription.status,
            'active': subscription.status in ['active', 'trialing'],
            'updated_at': datetime.now().isoformat()
        }
        
        response = supabase.table('client_subscriptions').update(update_data).eq('id', subscription_id).execute()
        
        if response.data:
            log_success(f"Suscripción actualizada para email: {customer_email}")
            stats['updated_subscriptions'] += 1
            return True
        else:
            log_error(f"Error actualizando suscripción para {customer_email}")
            return False
            
    except Exception as e:
        log_error(f"Error actualizando client subscription para {customer_email}: {str(e)}")
        return False

async def get_organization_by_owner_id(owner_id: str) -> Optional[Dict[str, Any]]:
    """Obtener organización por owner_id"""
    try:
        response = supabase.table('organizations').select(
            'id, name, owner_id'
        ).eq('owner_id', owner_id).single().execute()
        
        if response.data:
            return response.data
    except Exception as e:
        if "PGRST116" not in str(e):  # No encontrado
            log_error(f"Error buscando organización por owner_id {owner_id}: {str(e)}")
    
    return None

async def process_agency_subscriptions(billing_account: Dict[str, Any]):
    """Procesar suscripciones de una agencia"""
    provider_id = billing_account['provider_id']
    account_id = billing_account['account_id']
    
    # Buscar la organización usando el account_id como owner_id
    organization = await get_organization_by_owner_id(account_id)
    
    if not organization:
        log_error(f"No se encontró organización para account_id: {account_id}")
        return
    
    agency_id = organization['id']
    agency_name = organization['name']
    
    log_info(f"Procesando agencia: {agency_name} (ID: {agency_id})")
    
    # Obtener suscripciones de Stripe
    subscriptions = await get_stripe_subscriptions(provider_id)
    
    if not subscriptions:
        log_warning(f"No hay suscripciones para procesar en agencia {agency_name}")
        return
    
    success_count = 0
    
    # Procesar cada suscripción con barra de progreso
    with tqdm(total=len(subscriptions), desc=f"Procesando {agency_name}", 
              bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt}") as pbar:
        
        for subscription in subscriptions:
            try:
                # Obtener email del customer
                customer_email = await get_customer_email(subscription.customer, provider_id)
                
                if not customer_email:
                    stats['missing_emails'].append({
                        'customer_id': subscription.customer,
                        'subscription_id': subscription.id,
                        'agency': agency_name,
                        'agency_id': agency_id,
                        'reason': 'No email found in Stripe'
                    })
                    pbar.update(1)
                    continue
                
                # Buscar cliente en nuestra base de datos
                client = await find_client_by_email(customer_email, agency_id)
                
                if not client:
                    stats['missing_emails'].append({
                        'customer_id': subscription.customer,
                        'subscription_id': subscription.id,
                        'email': customer_email,
                        'agency': agency_name,
                        'agency_id': agency_id,
                        'status': subscription.status,
                        'period_starts_at': datetime.fromtimestamp(subscription['items']['data'][0]['current_period_start']).isoformat() if subscription['items']['data'][0]['current_period_start'] else None,
                        'period_ends_at': datetime.fromtimestamp(subscription['items']['data'][0]['current_period_end']).isoformat() if subscription['items']['data'][0]['current_period_end'] else None,
                        'reason': 'Client not found in database'
                    })
                    pbar.update(1)
                    continue
                
                # Verificar si ya existe la suscripción
                existing_subscription_id = await check_existing_subscription(subscription.customer)

                if existing_subscription_id:
                    # Actualizar suscripción existente
                    success = await update_client_subscription(existing_subscription_id, subscription, customer_email)
                else:
                    # Crear nueva suscripción
                    success = await create_client_subscription(client['id'], subscription, customer_email)
                
                if success:
                    success_count += 1
                    stats['successful_syncs'] += 1
                else:
                    stats['failed_syncs'] += 1
                
            except Exception as e:
                log_error(f"Error procesando suscripción {subscription.id}: {str(e)}")
                stats['failed_syncs'] += 1
            
            pbar.update(1)
    
    log_success(f"Agencia {agency_name} procesada: {success_count}/{len(subscriptions)} exitosas")
    stats['processed_agencies'] += 1

async def generate_fallback_report():
    """Generar reporte de emails faltantes"""
    if not stats['missing_emails']:
        log_success("No hay emails faltantes para reportar")
        return
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"missing_emails_report_{timestamp}.json"
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(stats['missing_emails'], f, indent=2, ensure_ascii=False)
        
        log_warning(f"Reporte de emails faltantes generado: {filename}")
        log_info(f"Total de emails faltantes: {len(stats['missing_emails'])}")
        
    except Exception as e:
        log_error(f"Error generando reporte: {str(e)}")

async def main():
    print(f"{BLUE}🚀 Iniciando migración de suscripciones de Stripe{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    
    # Obtener billing accounts de Stripe
    billing_accounts = await get_billing_accounts_stripe()
    
    if not billing_accounts:
        log_error("No hay cuentas de Stripe para procesar")
        return
    
    log_info(f"Iniciando procesamiento de {len(billing_accounts)} agencias")
    
    # Procesar cada agencia
    for billing_account in billing_accounts:
        await process_agency_subscriptions(billing_account)
        print()  # Espacio entre agencias
    
    # Generar reporte de fallback
    await generate_fallback_report()
    
    # Mostrar estadísticas finales
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}📊 RESUMEN DE MIGRACIÓN{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{GREEN}✓ Agencias procesadas: {stats['processed_agencies']}{RESET}")
    print(f"{GREEN}✓ Sincronizaciones exitosas: {stats['successful_syncs']}{RESET}")
    print(f"{GREEN}✓ Suscripciones creadas: {stats['created_subscriptions']}{RESET}")
    print(f"{GREEN}✓ Suscripciones actualizadas: {stats['updated_subscriptions']}{RESET}")
    print(f"{RED}✗ Sincronizaciones fallidas: {stats['failed_syncs']}{RESET}")
    print(f"{YELLOW}⚠ Emails faltantes: {len(stats['missing_emails'])}{RESET}")
    
    if stats['missing_emails']:
        print(f"{YELLOW}⚠ Revisa el archivo de reporte para procesar manualmente los casos faltantes{RESET}")
    
    print(f"{GREEN}🎉 Migración completada exitosamente{RESET}")

if __name__ == "__main__":
    asyncio.run(main())