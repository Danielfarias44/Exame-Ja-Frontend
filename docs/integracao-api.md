# Integração do frontend com a API

## Estado atual

As rotas abaixo foram extraídas de `Exame_Ja_Organizacao_Equipe.pdf`, seções 2.2 e 3.2.
O cliente JavaScript está em `public/api/client.js` e não depende de React.

O login está conectado a `http://localhost:3333/api`, configurado em
`public/api/config.js`. O contrato foi confirmado no código local do backend:

- `POST /auth/login`: JSON `{ email, password }`.
- Resposta: `{ success: true, data: { user, token } }`.
- `GET /users/me`: cabeçalho `Authorization: Bearer <token>`.
- Perfil: `{ success: true, data: { name, email, ... } }`.

O login valida o token consultando o perfil antes de redirecionar. O token fica
em `sessionStorage` na aba atual; a senha não é persistida e é apagada após a
tentativa. O botão Sair remove a sessão local. Não existe endpoint de revogação
no backend inspecionado. Uma resposta 401 na consulta do perfil remove o token.

Abra `/login.html` pelo servidor do frontend. A API precisa estar em execução.
O backend atual permite CORS com Bearer; não utilizamos cookies cross-origin.
Em produção, altere a URL para a API HTTPS e ajuste a origem permitida no backend.

O chat permanece demonstrativo: o backend encontrado implementa apenas as rotas
de autenticação e usuário. As demais rotas abaixo estão preparadas no cliente,
mas não são chamadas pela interface até que sejam implementadas no backend.

## Rotas preparadas

| Método do cliente | Endpoint |
| --- | --- |
| `register(data)` | `POST /auth/register` |
| `login(data)` | `POST /auth/login` |
| `getCurrentUser()` | `GET /users/me` |
| `updateCurrentUser(data)` | `PUT /users/me` |
| `getAppointments()` | `GET /appointments` |
| `createAppointment(data)` | `POST /appointments` |
| `updateAppointment(id, data)` | `PUT /appointments/:id` |
| `cancelAppointment(id)` | `DELETE /appointments/:id` |
| `getHistory()` | `GET /history` |
| `getConversations()` | `GET /conversations` |
| `getMessages(id)` | `GET /conversations/:id/messages` |
| `sendMessage(id, data)` | `POST /conversations/:id/messages` |
| `createReview(data)` | `POST /reviews` |
| `getNotifications()` | `GET /notifications` |

Não foi criada uma rota de recuperação de senha: o PDF não informa seu endereço.

## Informações ainda necessárias para os demais módulos

- URL da API, incluindo prefixos como `/api` ou `/v1`, se existirem.
- Campos obrigatórios e exemplos de requisição/resposta de cada rota utilizada.
- Como funciona a autenticação: cookie de sessão ou token, expiração e renovação.
- Configuração de CORS e eventual proteção CSRF.
- Estrutura das conversas, mensagens, paginação e identificação do remetente.
- Formato das respostas de erro e códigos HTTP.

Os contratos de login e perfil já foram confirmados. Os demais módulos ainda dependem dos exemplos acima.

## Uso após definição do contrato

Em um script JavaScript servido pelo frontend:

```js
import { createApiClient } from '/api/client.js'

// Valores fornecidos pela configuração real do projeto; não são definidos pelo PDF.
const api = createApiClient({
  baseUrl: backendConfig.baseUrl,
  credentials: backendConfig.credentials,
  getHeaders: backendConfig.getHeaders,
})

// loginPayload deve seguir os nomes de campos definidos pelo backend.
const result = await api.login(loginPayload)
// Confirmar e estabelecer a sessão conforme o contrato antes de redirecionar.
```

Para cookie em outra origem, `credentials: 'include'` só deve ser configurado
quando o backend estiver preparado para essa integração. Para token, `getHeaders`
pode fornecer o cabeçalho de autorização conforme o contrato. O cliente não salva
tokens nem senhas e não registra corpos de requisição no console.

As telas devem desabilitar envios duplicados durante a requisição, manter rascunhos
em caso de erro e só informar sucesso depois de interpretar a resposta real.
Uma falha de conexão ou timeout em um POST não comprova que a operação falhou no
servidor; por isso, o cliente não repete envios automaticamente.

## Verificação local

```sh
node --test tests/api.test.js
npm run build
npm run lint
```

Os testes usam respostas simuladas. Eles validam o cliente, não a disponibilidade
ou a compatibilidade de um backend real.
