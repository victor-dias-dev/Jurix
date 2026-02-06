---

# 📕 DOCUMENTAÇÃO DE REGRAS DE NEGÓCIO

Esta seção descreve **o que o sistema faz**, **por que faz** e **quais regras devem ser respeitadas**, independentemente de tecnologia.

---

## 1. Objetivo do Sistema

Gerenciar contratos jurídicos corporativos garantindo:

* Segurança da informação
* Controle de acesso por perfil
* Workflow formal de aprovação
* Histórico completo de versões
* Auditoria para compliance

O sistema simula um **ambiente legal corporativo**, substituindo ferramentas terceiras.

---

## 2. Entidades de Negócio

### Usuário

Representa uma pessoa autenticada no sistema.

Atributos relevantes:

* Identidade única
* Perfil (role)
* Status ativo/inativo

---

### Contrato

Documento jurídico gerenciado pelo sistema.

Atributos principais:

* Título
* Conteúdo
* Status
* Responsável pela criação
* Datas relevantes

---

### Versão de Contrato

Snapshot imutável de um contrato em determinado momento.

Criada sempre que:

* Conteúdo é alterado
* Status é alterado

---

### Log de Auditoria

Registro imutável de ações relevantes executadas no sistema.

---

## 3. Perfis de Usuário (Roles)

### ADMIN

* Administração completa do sistema
* Gerenciamento de usuários
* Acesso total a contratos

### LEGAL

* Criação e edição de contratos
* Envio para revisão
* Aprovação ou rejeição

### VIEWER

* Visualização de contratos e histórico
* Sem permissão de alteração

---

## 4. Matriz de Permissões

| Ação                | ADMIN | LEGAL | VIEWER |
| ------------------- | ----- | ----- | ------ |
| Criar contrato      | ✅     | ✅     | ❌      |
| Editar contrato     | ✅     | ✅     | ❌      |
| Enviar para revisão | ✅     | ✅     | ❌      |
| Aprovar contrato    | ✅     | ✅     | ❌      |
| Rejeitar contrato   | ✅     | ✅     | ❌      |
| Visualizar contrato | ✅     | ✅     | ✅      |
| Excluir contrato    | ✅     | ❌     | ❌      |
| Gerenciar usuários  | ✅     | ❌     | ❌      |

---

## 5. Ciclo de Vida do Contrato

### Estados Possíveis

* DRAFT
* IN_REVIEW
* APPROVED
* REJECTED

### Fluxo Oficial

```
DRAFT → IN_REVIEW → APPROVED
                ↘ REJECTED
```

---

## 6. Regras de Transição de Status

### DRAFT

* Pode ser criado por ADMIN ou LEGAL
* Pode ser editado livremente
* Não é visível para VIEWER

### IN_REVIEW

* Contrato em análise
* Pode ser visualizado por VIEWER
* Não pode ser editado

### APPROVED

* Contrato finalizado
* Não pode ser editado nem excluído
* Disponível apenas para leitura

### REJECTED

* Contrato devolvido para ajustes
* Pode retornar para DRAFT

---

## 7. Regras de Edição

* Contratos APPROVED nunca podem ser editados
* Qualquer edição gera nova versão
* Alterações são atribuídas ao usuário autenticado

---

## 8. Versionamento de Contratos

Regras:

* Cada modificação gera uma nova versão
* Versões antigas são imutáveis
* Histórico é sempre acessível

Objetivo:

* Auditoria
* Comparação histórica
* Rastreabilidade legal

---

## 9. Workflow de Aprovação

* Apenas ADMIN ou LEGAL podem aprovar
* Aprovação gera nova versão
* Aprovação gera log de auditoria

Rejeição:

* Exige justificativa
* Retorna contrato para edição

---

## 10. Autenticação e Sessão

* Usuário deve estar autenticado
* Sessão expirada invalida qualquer ação
* Tokens inválidos bloqueiam acesso

---

## 11. Regras de Segurança

* Toda ação exige validação de perfil
* Usuários VIEWER nunca alteram dados
* Logs não podem ser editados ou excluídos

---

## 12. Auditoria e Compliance

Eventos auditáveis:

* Login
* Logout
* Criação de contrato
* Edição
* Envio para revisão
* Aprovação
* Rejeição

Cada log registra:

* Usuário
* Ação
* Data e hora
* Identificador do contrato

---

## 13. Restrições Gerais

* Contratos aprovados são somente leitura
* Exclusão de contrato é restrita ao ADMIN
* Dados históricos nunca são removidos

---

## 14. Indicadores de Negócio (KPIs)

* Tempo médio de aprovação
* Quantidade de contratos por status
* Volume de contratos aprovados por período
* Atividade por perfil de usuário

---

## ✅ Considerações de Negócio Finais

As regras aqui descritas garantem:

* Governança
* Segurança jurídica
* Rastreabilidade
* Conformidade corporativa

Esta documentação é independente da implementação técnica e representa o **contrato de negócio do sistema**.