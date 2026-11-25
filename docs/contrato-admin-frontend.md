# Contrato da área administrativa

A área `/admin` do frontend depende de uma conta autenticada cujo tipo seja `admin` ou `administrador`. A sessão deve ser validável por `GET /api/auth/me` e retornar o identificador e o tipo da conta.

## Clínicas pendentes

`GET /api/admin/clinics?status=pendente` deve retornar `{ "clinicas": [...] }`. Cada clínica deve incluir `uid` ou `id`, `nomeFantasia`, `razaoSocial`, `cnpj`, `email`, `endereco` e `telefone` quando disponíveis.

## Aprovar

`POST /api/admin/clinics/:uid/approve`, protegido por autenticação e CSRF, aprova a clínica. Resposta de sucesso HTTP 200 ou 204.

## Rejeitar

`POST /api/admin/clinics/:uid/reject`, protegido por autenticação e CSRF, recebe `{ "motivo": "..." }`. O backend deve validar e persistir o motivo e mudar o status para rejeitada. Resposta de sucesso HTTP 200 ou 204.

O backend deve autorizar essas operações pelo perfil administrativo, independentemente da proteção das rotas no frontend.

## Nomes em conversas e agendamentos

Para exibir nomes sem depender de cache local, as respostas devem incluir `clienteNome` e `clinicaNome` nas conversas e agendamentos, ou objetos relacionados `cliente: { nome }` e `clinica: { nomeFantasia }`.
