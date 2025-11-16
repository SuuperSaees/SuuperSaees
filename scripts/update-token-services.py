import os
from supabase import create_client, Client
import json
from datetime import datetime
import asyncio
from typing import Dict, Any, List, Optional
import base64
import logging
from urllib.parse import urlparse, parse_qs

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('token_updates.log'),
        logging.StreamHandler()
    ]
)

# Console colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

# Supabase configuration
SUPABASE_URL = "your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def decode_token(token: str) -> Optional[Dict]:
    try:
        # Split the token and get the payload part
        base64_payload = token.split('.')[1]
        # Decode the payload
        payload = json.loads(base64.b64decode(base64_payload + '=' * (-len(base64_payload) % 4)).decode('utf-8'))
        return payload
    except Exception as e:
        logging.error(f"Error decoding token: {str(e)}")
        return None

def extract_token_id(checkout_url: str) -> Optional[str]:
    try:
        parsed_url = urlparse(checkout_url)
        query_params = parse_qs(parsed_url.query)
        return query_params.get('tokenId', [None])[0]
    except Exception as e:
        logging.error(f"Error extracting tokenId from URL: {str(e)}")
        return None

async def process_single_token(token: Dict) -> tuple[int, int]:
    try:
        # Decode the access token
        decoded_payload = decode_token(token['access_token'])
        
        if not decoded_payload or 'service' not in decoded_payload or 'id' not in decoded_payload['service']:
            logging.warning(f"Token {token['id']} has no service.id in payload")
            return 0, 1

        service_id = decoded_payload['service']['id']

        # Get service checkout_url
        service_response = supabase.table('services').select(
            'checkout_url'
        ).eq('id', service_id).single().execute()

        if not service_response.data or not service_response.data.get('checkout_url'):
            logging.warning(f"No checkout_url found for service {service_id}")
            return 0, 1

        # Extract tokenId from checkout_url
        token_id = extract_token_id(service_response.data['checkout_url'])
        if not token_id:
            logging.warning(f"Could not extract tokenId from checkout_url for service {service_id}")
            return 0, 1

        # Get new access_token using token_id
        new_token_response = supabase.table('tokens').select(
            'access_token'
        ).eq('id_token_provider', token_id).single().execute()

        if not new_token_response.data:
            logging.warning(f"No token found with id_token_provider {token_id}")
            return 0, 1

        # Update the original token with new access_token
        update_response = supabase.table('tokens').update({
            'access_token': new_token_response.data['access_token']
        }).eq('id', token['id']).execute()

        if update_response.data:
            logging.info(f"{GREEN}Successfully updated token {token['id']}{RESET}")
            return 1, 0
        else:
            logging.error(f"{RED}Failed to update token {token['id']}{RESET}")
            return 0, 1

    except Exception as e:
        logging.error(f"{RED}Error processing token {token.get('id')}: {str(e)}{RESET}")
        return 0, 1

async def process_token_batch(tokens: List[Dict]) -> tuple[int, int]:
    # Process tokens concurrently using asyncio.gather
    results = await asyncio.gather(*[process_single_token(token) for token in tokens])
    
    # Sum up the results
    updated_count = sum(r[0] for r in results)
    failed_count = sum(r[1] for r in results)
    
    return updated_count, failed_count

async def main():
    try:
        target_date = "2025-02-26 18:19:33.55659+00"
        
        # Get all tokens with provider 'suuper' created before target date
        response = supabase.table('tokens').select(
            'id, access_token'
        ).eq('provider', 'suuper').lt('created_at', target_date).execute()

        if not response.data:
            logging.info("No tokens found to process")
            return

        total_tokens = len(response.data)
        logging.info(f"Found {total_tokens} tokens to process")

        # Process tokens in batches of 50 for better performance
        batch_size = 50
        total_updated = 0
        total_failed = 0

        for i in range(0, total_tokens, batch_size):
            batch = response.data[i:i + batch_size]
            updated, failed = await process_token_batch(batch)
            total_updated += updated
            total_failed += failed
            
            logging.info(f"Progress: {i + len(batch)}/{total_tokens} tokens processed")

        logging.info(f"{GREEN}Processing completed:{RESET}")
        logging.info(f"Total tokens processed: {total_tokens}")
        logging.info(f"{GREEN}Successfully updated: {total_updated}{RESET}")
        logging.info(f"{RED}Failed to update: {total_failed}{RESET}")

    except Exception as e:
        logging.error(f"{RED}Critical error: {str(e)}{RESET}")

if __name__ == "__main__":
    asyncio.run(main())