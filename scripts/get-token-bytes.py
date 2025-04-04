import base64
import json

def calculate_token_size(token):
    """Calcula el tamaño de un token en bytes."""
    token_bytes = token.encode('utf-8')
    size_bytes = len(token_bytes)
    
    # Formatea la salida para tamaños más legibles
    if size_bytes < 1024:
        return f"{size_bytes} bytes"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB ({size_bytes} bytes)"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB ({size_bytes} bytes)"

def analyze_jwt(token):
    parts = token.split('.')
    if len(parts) != 3:
        print(f"El token no parece ser un JWT válido (tiene {len(parts)} partes en lugar de 3)")
        return
    
    # Función para decodificar correctamente cada parte del JWT
    def decode_base64_url(b64string):
        # Ajustar padding
        padding = '=' * (4 - len(b64string) % 4)
        # Reemplazar caracteres especiales de base64url
        b64string = b64string.replace('-', '+').replace('_', '/')
        return base64.b64decode(b64string + padding)
    
    # Analizar cada parte
    try:
        header_bytes = decode_base64_url(parts[0])
        payload_bytes = decode_base64_url(parts[1])
        signature_bytes = decode_base64_url(parts[2])
    except Exception as e:
        print(f"Error al decodificar partes del token: {e}")
        return
    
    # Mostrar tamaños
    total_size = len(token.encode('utf-8'))
    print("Análisis del token JWT:")
    print("-----------------------------------")
    print(f"Tamaño total: {total_size / 1024:.2f} KB ({total_size} bytes)")
    print(f"Tamaño del header: {len(header_bytes)} bytes")
    print(f"Tamaño del payload: {len(payload_bytes)} bytes")
    print(f"Tamaño de la firma: {len(signature_bytes)} bytes")
    
    # Mostrar contenido decodificado
    print("\nContenido del header:")
    print(json.dumps(json.loads(header_bytes), indent=2))
    
    print("\nPrimeras 100 organizaciones en el payload (si existen):")
    payload_json = json.loads(payload_bytes)
    try:
        orgs = payload_json.get('app_metadata', {}).get('organizations', [])
        print(f"Total organizaciones: {len(orgs)}")
        print(f"¿Son todas idénticas? {all(org == orgs[0] for org in orgs)}")
    except:
        print("No se encontraron organizaciones en el payload")

# Para usar como script independiente
if __name__ == "__main__":
    print("Analizador de tamaño de tokens JWT")
    print("==================================")
    
    # Opciones para input: directo o desde archivo
    option = input("¿Deseas introducir el token manualmente (1) o desde un archivo (2)? ")
    
    token = ""
    if option == "1":
        token = input("Pega tu token JWT: ")
    elif option == "2":
        file_path = input("Introduce la ruta del archivo que contiene el token: ")
        try:
            with open(file_path, 'r') as file:
                token = file.read().strip()
        except Exception as e:
            print(f"Error al leer el archivo: {e}")
            exit(1)
    else:
        print("Opción no válida")
        exit(1)
    
    analyze_jwt(token)