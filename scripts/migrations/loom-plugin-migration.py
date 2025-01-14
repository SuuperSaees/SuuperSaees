import os
import json
from datetime import datetime
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
from dotenv import load_dotenv
import uuid

load_dotenv()

class CredentialsEncryptor:
    def __init__(self, secret_key):
        self.secret_key = bytes.fromhex(secret_key)
        if len(self.secret_key) != 32:
            raise ValueError("Secret key must be 32 bytes for AES-256")
        
        self.aesgcm = AESGCM(self.secret_key)

    def encrypt(self, data):
        iv = os.urandom(16)
        
        json_data = json.dumps(data).encode('utf-8')
        
        encrypted = self.aesgcm.encrypt(iv, json_data, None)
        
        return {
            'data': encrypted[:-16].hex(),  
            'iv': iv.hex(),
            'version': 1,
            'tag': encrypted[-16:].hex() 
        }

def main():
    encryption_key = os.getenv('ENCRYPTION_KEY')
    if not encryption_key:
        raise ValueError("ENCRYPTION_KEY environment variable is required")\

    # YOUR loom provider id

    LOOM_PROVIDER_ID = uuid.uuid4()  

    providers = [
        # YOUR provider
        {
            'account_id': 'bc5a7eb1-98c9-429d-9b61-eebbca314682',
            'user_id': 'fd052e52-0223-4079-9f3e-a3056c9e8a57',    
            'provider': 'loom'
        }
    ]

    encryptor = CredentialsEncryptor(encryption_key)
    sql_content = ''

    for provider in providers:
        # YOUR plugin_id
        plugin_id = 'c9a95821-6d63-4588-98b1-47d4aaaa46be',
        
        credentials = {
            'loom_app_id': provider['account_id'],
        }


        encrypted = encryptor.encrypt(credentials)

        sql_insert = f"""INSERT INTO account_plugins (
    plugin_id,
    account_id,
    status,
    credentials,
    created_at,
    updated_at,
    deleted_on,
    provider_id
) VALUES (
    {plugin_id},
    '{provider['user_id']}',
    'installed',
    '{json.dumps(encrypted)}',
    NOW(),
    NOW(),
    NULL,
    '{LOOM_PROVIDER_ID}'
);\n\n"""

        sql_content += sql_insert

    # Guardar en archivo
    with open('loom-plugin.sql', 'w') as f:
        f.write(sql_content)
    
    print('SQL file generated successfully!')

if __name__ == '__main__':
    main()