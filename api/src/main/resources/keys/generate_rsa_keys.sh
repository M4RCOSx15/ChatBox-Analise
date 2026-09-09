#!/bin/bash
# =========================================================
# Script: generate_rsa_keys.sh
# Gera um par de chaves RSA (privada e pública)
# Uso: bash generate_rsa_keys.sh
# =========================================================

# Caminho padrão para salvar as chaves
KEYS_DIR="./keys"

# Tamanho da chave
BITS=2048

# Cria diretório, se não existir
mkdir -p $KEYS_DIR

# Gera a chave privada
echo "🔐 Gerando chave privada RSA ($BITS bits)..."
openssl genpkey -algorithm RSA -out "$KEYS_DIR/private_key.pem" -pkeyopt rsa_keygen_bits:$BITS

# Extrai a chave pública
echo "📤 Gerando chave pública correspondente..."
openssl rsa -pubout -in "$KEYS_DIR/private_key.pem" -out "$KEYS_DIR/public_key.pem"

# Ajusta as permissões
chmod 600 "$KEYS_DIR/private_key.pem"
chmod 644 "$KEYS_DIR/public_key.pem"

# Exibe resultado
echo ""
echo "✅ Chaves geradas com sucesso!"
echo "📁 Localização:"
echo "   → Chave privada: $KEYS_DIR/private_key.pem"
echo "   → Chave pública: $KEYS_DIR/public_key.pem"
echo ""
echo "💡 Dica: mantenha a chave privada em local seguro e nunca a comite no Git!"