-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar schema para organização
CREATE SCHEMA IF NOT EXISTS jurix;

-- Comentário informativo
COMMENT ON DATABASE jurix_db IS 'Plataforma de Contratos Jurídicos - Jurix';
