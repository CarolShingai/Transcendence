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
KEYTOOL_IMAGE="${KEYTOOL_IMAGE:-eclipse-temurin:23-jdk}"

mkdir -p "${CERT_DIR}"

if [ -f "${KEYSTORE_FILE}" ]; then
  echo "[generate-keystore] keystore já existe: ${KEYSTORE_FILE}"
  exit 0
fi

# SAN para evitar erro de hostname no navegador/curl.
SAN_EXT="SAN=dns:localhost,ip:127.0.0.1"

KEYSTORE_TARGET_FILE="${KEYSTORE_FILE}"
CERT_PEM_TARGET_FILE="${CERT_PEM_FILE}"

if command -v keytool >/dev/null 2>&1; then
  run_keytool() {
    keytool "$@"
  }
elif command -v docker >/dev/null 2>&1; then
  CERT_DIR_DOCKER="/work/certs"
  KEYSTORE_TARGET_FILE="${CERT_DIR_DOCKER}/$(basename -- "${KEYSTORE_FILE}")"
  CERT_PEM_TARGET_FILE="${CERT_DIR_DOCKER}/$(basename -- "${CERT_PEM_FILE}")"

  run_keytool() {
    docker run --rm \
      -v "${CERT_DIR}:${CERT_DIR_DOCKER}" \
      "${KEYTOOL_IMAGE}" \
      keytool "$@"
  }
else
  echo "[generate-keystore] erro: 'keytool' não encontrado no host e Docker não está disponível no PATH." >&2
  echo "[generate-keystore] instale JDK (com keytool) ou Docker para gerar o keystore." >&2
  exit 127
fi

run_keytool -genkeypair \
  -alias "${KEY_ALIAS}" \
  -keyalg RSA \
  -keysize 2048 \
  -sigalg SHA256withRSA \
  -validity 825 \
  -storetype PKCS12 \
  -keystore "${KEYSTORE_TARGET_FILE}" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -keypass "${KEYSTORE_PASSWORD}" \
  -dname "CN=localhost, OU=Dev, O=Transcendence, L=Local, S=Local, C=BR" \
  -ext "${SAN_EXT}"

run_keytool -exportcert \
  -alias "${KEY_ALIAS}" \
  -keystore "${KEYSTORE_TARGET_FILE}" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -rfc \
  -file "${CERT_PEM_TARGET_FILE}"

echo "[generate-keystore] OK"
echo "  keystore: ${KEYSTORE_FILE}"
echo "  cert pem: ${CERT_PEM_FILE}"
echo "  alias:    ${KEY_ALIAS}"
