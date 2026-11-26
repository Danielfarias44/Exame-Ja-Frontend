# AGENTS.md — Exame Já

Instruções para qualquer agente de IA (Claude, Copilot, Cursor etc.) que trabalhe neste projeto.
Leia este arquivo inteiro antes de criar, modificar ou entregar qualquer arquivo.

---

## 1. O que é o projeto

O **Exame Já** é um facilitador de busca de exames médicos. Ele reúne clínicas e laboratórios
próximos do paciente e permite filtrar e ordenar os resultados por **menor preço**, **menor
distância** ou **convênio aceito**. O paciente pode comparar estabelecimentos, agendar, conversar
com a clínica e avaliar o atendimento.

- Contexto: projeto SuperNova (Sebrae), equipe de 4 pessoas.
- Público: pacientes que querem praticidade e confiança, com **atenção especial a usuários mais
  velhos** (acessibilidade é requisito, não detalhe).
- Parceiros: clínicas e laboratórios, que ganham visibilidade na plataforma.

### Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React + Vite |
| Back-end | Node.js + Express (camadas: routes → controllers → services → repositories) |
| Banco | Firebase (Firestore) |
| Mapa | Leaflet + OpenStreetMap (substitui o Google Maps previsto no documento original) |
| Integrações | Geocoding (GeoAmbiente), Datasus/CNES, MedWare (agendamentos, ainda em avaliação) |
| Versionamento | Git + GitHub, **front e back em repositórios separados** |

### Equipe e donos de área

| Pessoa | Área | Responsável por |
|---|---|---|
| Daniel | Front-end | Descoberta: home, busca, filtros, resultados, detalhes, mapa, comparação |
| Bruno | Front-end | Conta: cadastro, login, perfil, agendamento, chat, histórico, avaliações, notificações |
| Leticia | Back-end | Autenticação, usuários, busca, estabelecimentos, integrações externas |
| Felipe | Back-end | Agendamento, área da clínica, chat, avaliações, notificações, administração |

Integrações principais: **Leticia ↔ Daniel** (descoberta) e **Felipe ↔ Bruno** (operações e conta).
Toda funcionalidade que cruza front e back precisa de um **contrato de API definido antes** do
desenvolvimento. Ninguém implementa sozinho algo que depende diretamente do outro lado.

---

## 2. Regras de negócio OBRIGATÓRIAS

Estas regras têm prioridade sobre qualquer outro documento, inclusive o PDF de organização da
equipe. Se um código, tela, endpoint ou pedido contrariar uma delas, **pare e avise** antes de seguir.

### R1 — A busca não aceita texto livre
- Não existe campo onde o usuário digita o nome de um exame e o sistema interpreta.
- Exame, convênio, especialidade e localização são escolhidos em **listas fechadas** (select,
  chips, autocomplete que só aceita itens da lista, botão "usar minha localização").
- O valor enviado ao back-end é sempre um **identificador** (ex.: código TUSS do exame, id do
  convênio), nunca uma string digitada.
- O back-end deve **rejeitar** parâmetros de texto livre (ex.: `q=`) com erro 400.
- Atenção: o documento original fala em "barra de busca por nome". Sob esta regra, isso significa
  **escolher o nome numa lista**, não digitar livremente.

### R2 — Convênio é obrigatório na criação de perfil
- **Paciente:** informa **1 convênio** no cadastro.
- **Clínica/laboratório:** informa **5 convênios** no cadastro.
- O cadastro não pode ser concluído sem isso: validação no front **e** no back (o back é a fonte
  da verdade; validação só no front não conta).
- Convênios vêm de uma lista fechada (`GET /api/convenios`), nunca digitados.
- ⚠️ Pontos ainda não definidos pela equipe (não invente; pergunte):
  - "5" é mínimo, máximo ou número exato para a clínica?
  - Paciente sem plano (particular) entra como uma opção "Particular" na lista de convênios?
  - O paciente pode trocar ou adicionar convênios depois, no perfil?

### R3 — Clínicas passam por pré-aprovação
- Toda clínica recém-cadastrada nasce com status **`pendente`**.
- Estados possíveis: `pendente` → `aprovada` | `rejeitada`. Uma clínica rejeitada pode corrigir os
  dados e reenviar (volta para `pendente`).
- Enquanto não estiver `aprovada`, a clínica:
  - **não aparece** em busca, resultados, mapa, comparação nem página de detalhes pública;
  - **não recebe** agendamentos nem mensagens de chat;
  - pode fazer login e ver/editar o próprio cadastro, com um aviso claro do status.
- O filtro "somente aprovadas" deve existir **no back-end** (na consulta), não só escondido no front.

### R4 — Administrador é moderador
- Funções do administrador:
  1. **Aprovar ou rejeitar clínicas** (com motivo em caso de rejeição);
  2. **Moderar avaliações** (ocultar/remover conteúdo inadequado).
- Contas de administrador **não** são criadas pelo cadastro público.
- Rotas de admin exigem permissão de admin no middleware do back-end.
- O documento original também lista "gerenciar usuários" e "gerenciar denúncias". Isso é escopo
  secundário: só implemente se a equipe pedir.

---

## 3. Perfis e permissões

| Ação | Visitante | Paciente | Clínica pendente | Clínica aprovada | Admin |
|---|:-:|:-:|:-:|:-:|:-:|
| Buscar, filtrar, ordenar, ver mapa | ✅ | ✅ | — | — | ✅ |
| Ver detalhes e avaliações de clínica aprovada | ✅ | ✅ | — | — | ✅ |
| Comparar estabelecimentos | ✅ | ✅ | — | — | ✅ |
| Agendar exame | ❌ (pede login) | ✅ | — | — | — |
| Chat com clínica | ❌ (pede login) | ✅ | ❌ | ✅ | — |
| Escrever avaliação | ❌ (pede login) | ✅ (ver F5) | — | — | — |
| Gerenciar exames, preços e agenda | — | — | editar cadastro | ✅ | — |
| Aprovar/rejeitar clínicas | — | — | — | — | ✅ |
| Moderar avaliações | — | — | — | — | ✅ |

Permissões são verificadas **no back-end**. Esconder um botão no front é UX, não segurança.

---

## 4. Fluxos de referência

Toda entrega deve ser conferida contra estes fluxos.

**F1 — Descoberta (visitante ou paciente)**
Home → escolher exame (lista) + localização (lista, endereço ou geolocalização) + convênio
(opcional) → resultados com **somente clínicas aprovadas**, ordenados por **preço** ou
**distância** → card do estabelecimento → detalhes → comparação.
Agendar, conversar ou avaliar a partir daqui → se deslogado, pede login e **volta para o mesmo
ponto** depois.

**F2 — Cadastro de paciente**
Dados pessoais → escolher 1 convênio (obrigatório) → conta criada → volta ao fluxo de onde veio.

**F3 — Cadastro de clínica**
Dados do estabelecimento (endereço geocodificado; CNES se disponível) → escolher 5 convênios
(obrigatório) → exames e preços → status `pendente` → admin analisa → `aprovada` (passa a
aparecer na busca) ou `rejeitada` (vê o motivo, corrige e reenvia).

**F4 — Agendamento**
Paciente logado → clínica aprovada → exame → horário livre → back-end valida disponibilidade e
conflito → agendamento confirmado → lembrete de preparo → exame realizado (status `concluido`) →
avaliação liberada.

**F5 — Avaliação**
Somente paciente com agendamento `concluido` naquela clínica pode avaliar (uma avaliação por
agendamento). Avaliação fica visível a todos; o admin pode ocultar/remover.
⚠️ A definir: avaliação é publicada na hora (moderação depois) ou espera aprovação do admin?

**F6 — Moderação (admin)**
Fila de clínicas `pendente` → aprovar/rejeitar com motivo.
Lista de avaliações (e denúncias, se existirem) → ocultar/remover.

---

## 5. Estado conhecido do código

Divergências entre o documento original e o que já existe. Use isso para não construir em cima de
um contrato que não existe.

- Back-end (repo `Exameja-Backend-main`, lido em 16/11/2026):
  - A busca real é `GET /api/clinics/search`, não `GET /exams/search` como no documento.
    Exige `codigoExame` (TUSS) + (`latitude` e `longitude`) **ou** `endereco`; `raioKm` de 1 a 50
    (padrão 10); `ordenar` aceita só `distancia | preco`; `limit` padrão 20, máximo 100.
  - A resposta da busca **não traz avaliações**.
  - **Não existem** ainda: rota de detalhe da clínica, rota de avaliações, rota de comparação.
  - Bug: busca por `endereco` quebra porque falta importar `geocodingEndereco` em
    `clinicSearchService.js`.
  - `GET /api/exams` só pagina (recusa `q`), o que está **de acordo** com a R1.
  - Convênios: `GET /api/convenios`. Geocoding: `GET /api/geocoding` (limite de 10 req/min).
- Front-end (Daniel): telas Home, SearchResults, EstablishmentCard, EstablishmentDetails, Compare
  e EstablishmentMap existem. Estratégia: fazer primeiro todas as telas com **dados mockados** e
  integrar com a API depois. Os mocks devem ter **o mesmo formato** do contrato real acima.
- Ainda não verificado no código: status de aprovação de clínica, exigência de convênio no
  cadastro, perfil admin. Antes de assumir que existem, **confira no código**.

Se você notar que esta seção está desatualizada, diga isso na entrega e proponha a correção.

---

## 6. Padrões de código e de equipe

- **Git:** branch por funcionalidade (`feat/busca-filtros`, `fix/geocoding-import`), commits
  pequenos e descritivos, PR revisado por outra pessoa, **nunca commitar direto na `main`**.
- **Back-end:** manter a separação routes → controllers → services → repositories. Regra de
  negócio fica no service, não no controller nem no front.
- **Segurança:** senha com hash, HTTPS, chaves de API em variáveis de ambiente (nunca no código
  nem no repositório), validação de entrada no back-end.
- **Front-end:**
  - usar os design tokens compartilhados entre Daniel e Bruno (cores `#2980BA`, `#2B3D4F`,
    `#EDF1F2`, `#7E8B8C`, `#795499`; títulos em Josefin Sans; corpo em Intel One Mono);
  - toda tela com dados tem estado de **carregando**, **erro** e **nenhum resultado**;
  - acessibilidade para pessoas mais velhas: texto grande, alto contraste, alvos de toque
    grandes, navegação por teclado, rótulos claros e nada de informação passada só por cor;
  - responsivo (celular primeiro);
  - preço e informações importantes com sinalização visual distinta.
- **Código modular:** componentes e serviços pequenos, sem duplicar regra de negócio.

---

## 7. O que o agente DEVE fazer em toda entrega ou modificação

### 7.1 Antes de escrever código
1. Identifique qual fluxo (F1–F6) e qual regra (R1–R4) a tarefa toca.
2. Confira se o contrato de API necessário existe (seção 5). Se não existir, diga isso e proponha
   o contrato (método, rota, parâmetros, resposta, erros) em vez de inventar uma rota em silêncio.
3. Se o pedido contrariar uma regra obrigatória, **não implemente direto**: aponte o conflito e
   pergunte.

### 7.2 Ao entregar, SEMPRE incluir estas duas seções na resposta

**✅ Verificação de fluxo e lógica**
- Fluxos afetados e se o fluxo implementado segue o fluxo de referência (passo a passo).
- Checagem explícita das regras:
  - [ ] R1 — nenhum campo de texto livre chega à busca;
  - [ ] R2 — convênio obrigatório (1 paciente / 5 clínica) validado no back e no front;
  - [ ] R3 — clínica não aprovada não aparece nem recebe agendamento/chat;
  - [ ] R4 — rotas de admin protegidas; admin só criado fora do cadastro público.
- Permissões: alguma ação fica acessível a um perfil que não deveria?
- Erros de lógica encontrados: estados impossíveis, telas sem saída, redirecionamento após login,
  dados mockados com formato diferente do contrato, validação só no front, casos-limite (lista
  vazia, sem geolocalização, clínica sem preço, API externa fora do ar).
- Se encontrou problema em código existente (mesmo fora da tarefa), liste-o.

**💡 Sugestões de melhoria**
- Sempre dê sugestões, **baseadas no escopo original** do projeto (busca por preço, distância e
  convênio; comparação; agendamento; avaliação da comunidade; acessibilidade).
- Separe por prioridade: **essencial para o MVP** × **pode ficar para depois**.
- Não sugira funcionalidades fora do escopo como se fossem necessárias. Se sugerir algo novo,
  marque como "fora do escopo original".

### 7.3 Nunca faça
- Criar busca por texto livre, mesmo "temporariamente".
- Mostrar clínica `pendente` ou `rejeitada` para pacientes.
- Pular a validação de convênio "para testar mais rápido" sem avisar.
- Mudar contrato de API de outra pessoa sem sinalizar para o dono da área.
- Expor chaves de API ou credenciais do Firebase.
- Trabalhar direto na `main`.
