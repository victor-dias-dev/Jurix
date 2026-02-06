-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Garantir encoding UTF-8
SET client_encoding = 'UTF8';

-- Mensagem de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Jurix database initialized successfully!';
END $$;

