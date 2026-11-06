CREATE TABLE IF NOT EXISTS produtos (
  id             SERIAL PRIMARY KEY,
  sku            VARCHAR(50)  NOT NULL UNIQUE,
  nome           VARCHAR(200) NOT NULL,
  unidade        VARCHAR(10)  NOT NULL DEFAULT 'UN',
  estoque_minimo NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  saldo          NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (saldo >= 0),
  criado_em      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id          SERIAL PRIMARY KEY,
  produto_id  INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  tipo        VARCHAR(7) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
  quantidade  NUMERIC(14,3) NOT NULL CHECK (quantidade > 0),
  saldo_apos  NUMERIC(14,3) NOT NULL,
  documento   VARCHAR(100),
  observacao  TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mov_produto ON movimentacoes (produto_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_mov_data    ON movimentacoes (criado_em DESC);

CREATE OR REPLACE FUNCTION aplicar_movimentacao() RETURNS trigger AS $$
DECLARE
  delta NUMERIC;
  novo_saldo NUMERIC;
  atual RECORD;
BEGIN
  NEW.tipo := translate(upper(trim(NEW.tipo)), 'Í', 'I');

  IF NEW.tipo NOT IN ('ENTRADA', 'SAIDA') THEN
    RAISE EXCEPTION 'Tipo inválido: use ENTRADA ou SAIDA.';
  END IF;
  IF NEW.quantidade IS NULL OR NEW.quantidade <= 0 THEN
    RAISE EXCEPTION 'A quantidade deve ser maior que zero.';
  END IF;

  delta := CASE WHEN NEW.tipo = 'ENTRADA' THEN NEW.quantidade ELSE -NEW.quantidade END;

  UPDATE produtos SET saldo = saldo + delta
  WHERE id = NEW.produto_id AND saldo + delta >= 0
  RETURNING saldo INTO novo_saldo;

  IF NOT FOUND THEN
    SELECT saldo, unidade INTO atual FROM produtos WHERE id = NEW.produto_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto % não encontrado.', NEW.produto_id;
    END IF;
    RAISE EXCEPTION 'Saldo insuficiente: disponível % %.', replace(atual.saldo::float8::text, '.', ','), atual.unidade;
  END IF;

  NEW.saldo_apos := novo_saldo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_aplicar_movimentacao
  BEFORE INSERT ON movimentacoes
  FOR EACH ROW EXECUTE FUNCTION aplicar_movimentacao();

ALTER TABLE movimentacoes ADD COLUMN IF NOT EXISTS estorno_de INT UNIQUE REFERENCES movimentacoes(id);
