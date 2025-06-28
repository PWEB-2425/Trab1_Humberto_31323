
texto = "Criando meu Proprio Algoritmo de encriptação de Criptografia Teorico!"

num_bytes = len(texto.encode("utf-8"))
print(f"O texto tem {num_bytes} bytes")

import sys

from pkcs7 import PKCS7Encoder

def pkcs7_encode(text, k=16):
    """Codifica o texto usando PKCS#7 padding."""
    encoder = PKCS7Encoder(k)
    return encoder.encode(text)

def pkcs7_decode(text, k=16):
    pkcs7 = PKCS7Encoder(k)
    return pkcs7.decode(text)

def main():
    for c in sys.argv[1:]:
        enc = pkcs7_encode(c)
        dec = pkcs7_decode(enc)
        print("[%s] encode -> [%s] decode -> [%s]" % (repr(c), repr(enc), repr(dec)))
    return 0


import os
key = os.urandom(16)  # Chave de 128 bits
iv = os.urandom(16)   # CBC IV de 128 bits








