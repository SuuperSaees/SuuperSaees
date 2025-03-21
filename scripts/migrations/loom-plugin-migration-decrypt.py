import os
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from dotenv import load_dotenv

load_dotenv()

class CredentialsDecryptor:
    def __init__(self, secret_key):
        self.secret_key = bytes.fromhex(secret_key)
        if len(self.secret_key) != 32:
            raise ValueError("Secret key must be 32 bytes for AES-256")
        
        self.aesgcm = AESGCM(self.secret_key)

    def decrypt(self, encrypted_data):
        data = bytes.fromhex(encrypted_data['data'])
        iv = bytes.fromhex(encrypted_data['iv'])
        tag = bytes.fromhex(encrypted_data['tag'])
        
        ciphertext = data + tag
        
        decrypted = self.aesgcm.decrypt(iv, ciphertext, None)
        
        return json.loads(decrypted.decode('utf-8'))

def main():
    encryption_key = os.getenv('ENCRYPTION_KEY')
    if not encryption_key:
        raise ValueError("ENCRYPTION_KEY environment variable is required")

    decryptor = CredentialsDecryptor(encryption_key)

    # encrypted_credentials = {
    #     "data": "254590854627a0de1ca18a38f59ca9a4ec9fde391bc4789642be984b50271f6abb343f3f77e0c958e9c588d654b64cd115d90ca4ad1c7d", "iv": "38e086ca0614decf8c29a5808b40a6c7", "version": 1,
    #     "tag": "f0d6ea840349314cdb7d5188d64fa2de"
    #                          }

    encrypted_credentials = {
            "data": "254590854627a0de1ca18a38f59ca9a4ec9fde391bc4789642be984b50271f6abb343f3f77e0c958e9c588d654b64cd115d90ca4ad1c7d", "iv": "38e086ca0614decf8c29a5808b40a6c7", "version": 1,
            "tag": "f0d6ea840349314cdb7d5188d64fa2de"
                                }
    try:
        decrypted_data = decryptor.decrypt(encrypted_credentials)
        print("Decrypted credentials:", json.dumps(decrypted_data, indent=2))
    except Exception as e:
        print(f"Error decrypting credentials: {e}")

if __name__ == '__main__':
    main()