#!/usr/bin/env sh
set -eu

# Gera um keystore PKCS12 com certificado autoassinado para localhost.
# Uso:
#   KEYSTORE_PASSWORD=changeit ./certs/generate-keystore.sh dev
#   KEYSTORE_PASSWORD=changeit ./certs/generate-keystore.sh prod
#
# Saídas:
#   certs/keystore-<env>.p12
#   certs/cert-<env>.pem

ENV_NAME="${1:-dev}"
CERT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-changeit}"
KEYSTORE_FILE="${KEYSTORE_FILE:-${CERT_DIR}/keystore-${ENV_NAME}.p12}"
CERT_PEM_FILE="${CERT_PEM_FILE:-${CERT_DIR}/cert-${ENV_NAME}.pem}"
KEY_ALIAS="${KEY_ALIAS:-transcendence-${ENV_NAME}}"

mkdir -p "${CERT_DIR}"

if [ -f "${KEYSTORE_FILE}" ]; then
  echo "[generate-keystore] keystore já existe: ${KEYSTORE_FILE}"
  exit 0
fi

# SAN para evitar erro de hostname no navegador/curl.
SAN_EXT="SAN=dns:localhost,ip:127.0.0.1"

keytool -genkeypair \
  -alias "${KEY_ALIAS}" \
  -keyalg RSA \
  -keysize 2048 \
  -sigalg SHA256withRSA \
  -validity 825 \
  -storetype PKCS12 \
  -keystore "${KEYSTORE_FILE}" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -keypass "${KEYSTORE_PASSWORD}" \
  -dname "CN=localhost, OU=Dev, O=Transcendence, L=Local, S=Local, C=BR" \
  -ext "${SAN_EXT}"

keytool -exportcert \
  -alias "${KEY_ALIAS}" \
  -keystore "${KEYSTORE_FILE}" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -rfc \
  -file "${CERT_PEM_FILE}"

echo "[generate-keystore] OK"
echo "  keystore: ${KEYSTORE_FILE}"
echo "  cert pem: ${CERT_PEM_FILE}"
echo "  alias:    ${KEY_ALIAS}"
