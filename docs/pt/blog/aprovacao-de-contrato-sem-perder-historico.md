# Aprovação de contrato sem perder o histórico

Um botão de aprovar é fácil. O difícil é responder, seis meses depois, qual texto foi aprovado, quem enviou para revisão e o que mudou depois de uma rejeição. Se essas respostas moram numa única linha mutável, a linha é o histórico, e o histórico some no próximo save.

O Jurix separa isso em três registros que andam juntos.

## A máquina de estados é dado

As transições permitidas são um mapa, não uma cadeia de `if` espalhada pelos controllers:

```
DRAFT → IN_REVIEW → APPROVED
                 ↘ REJECTED → DRAFT
```

`DRAFT` não pula para `APPROVED`. `APPROVED` não vai a lugar nenhum. `REJECTED` pode voltar a `DRAFT`, e essa volta é um evento novo, não um desfazer. O mapa fica em `packages/shared-types`, então a API e qualquer cliente futuro usam a mesma definição. Um teste lista as transições válidas e as que precisam falhar. Quando alguém adiciona um status, o teste quebra até o mapa e quem chama concordarem.

## A linha atual não é o histórico

`contracts` guarda o texto que as pessoas veem hoje. `contract_versions` guarda um snapshot cada vez que o texto ou o status muda: número da versão, título, corpo, status, autor e motivo. As linhas dessa tabela são inseridas e nunca atualizadas. "O que o jurídico aprovou?" é uma consulta em versões, filtrada por status, não um palpite sobre a linha atual.

Isso custa uma cópia do texto por gravação. Para um contrato, esse custo é a funcionalidade. Editar uma versão no lugar transformaria a trilha numa história sobre a última pessoa que tocou no arquivo.

## A auditoria entra na mesma transação

Uma versão sem registro de quem fez, ou um log de auditoria cujo contrato não sofreu commit, é como relatório e produto se separam. Criar, atualizar, mudar status e excluir abrem uma transação do Sequelize. O insert da versão e o insert da auditoria recebem essa transação. Se o insert da versão falha, o log volta atrás junto.

A tabela de auditoria ainda é imutável só por convenção. O passo seguinte é um trigger no Postgres que recusa `UPDATE` e `DELETE` em `audit_logs`, para uma sessão no console não reescrever a trilha. Até esse trigger existir, a aplicação é a única escritora, e ela só insere.

## O que fica de fora

Refresh token, papéis e as telas em Next.js existem para o fluxo poder ser clicado. Não são o desenho. O desenho é o mapa de transições, a versão só de append e a auditoria que compartilha a transação. Copie esses três para outro domínio — pedidos de compra, exceções de política, revisões de acesso — antes de copiar a interface.
