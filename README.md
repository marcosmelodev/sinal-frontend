# SINAL (Front-End Web)

**Sistema de Acionamento de Emergência Acessível para a Comunidade Surda** — Protótipo Acadêmico

O SINAL oferece um fluxo **visual, rápido e sem dependência de chamadas de voz** para acionar órgãos de segurança e socorro (**Polícia Militar**, **SAMU** e **Corpo de Bombeiros**) ou alertar contatos de confiança. Toda a interação acontece por toques e leitura: sem ligação, sem áudio.

> ⚠️ **Protótipo acadêmico.** Nenhuma central real é acionada. O encaminhamento dos chamados é **simulado** pelo back-end, e a interface deixa isso explícito ao usuário.

Este repositório contém apenas o **front-end web**. A API REST (Spring Boot) fica em um repositório separado.

---

## Sumário

- [Stack tecnológica](#stack-tecnológica)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Arquitetura, segurança e acessibilidade](#arquitetura-segurança-e-acessibilidade)
- [Pré-requisitos e como executar localmente](#pré-requisitos-e-como-executar-localmente)
- [Integração com a API](#integração-com-a-api)
- [Limitações conhecidas](#limitações-conhecidas)
- [Licença](#licença)

---

## Stack tecnológica

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| [React](https://react.dev) | 19 | Interface baseada em componentes |
| [TypeScript](https://www.typescriptlang.org) | 6 | Tipagem estática, contratos da API espelhados dos DTOs Java |
| [Vite](https://vite.dev) | 8 | Servidor de desenvolvimento e build |
| [TailwindCSS](https://v3.tailwindcss.com) | 3.4 | Estilização utilitária e tokens de cor do projeto |
| [React Router](https://reactrouter.com) | 7 | Roteamento SPA e rotas protegidas |
| [Axios](https://axios-http.com) | 1 | Cliente HTTP com interceptors |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | 7 / 3 | Formulários e validação por schema |
| [Lucide React](https://lucide.dev) | 1 | Ícones |
| [uuid](https://github.com/uuidjs/uuid) | 14 | Geração das chaves de idempotência (v4) |
| [Oxlint](https://oxc.rs) | 1 | Lint |

---

## Funcionalidades implementadas

### Autenticação

- **Cadastro** com validação de formato do CPF (11 dígitos, com ou sem máscara), e-mail e senha (mínimo de 6 caracteres). O CPF é enviado à API apenas com dígitos.
- **Login** por CPF ou e-mail, com token **JWT** (Bearer) armazenado localmente.
- **Isolamento dos dados de sessão por ID do usuário:** os dados de perfil ficam guardados por usuário, identificado pelo `sub` do JWT. Duas pessoas que usem o mesmo aparelho não veem os dados uma da outra.
- **Logout** pela tela de Perfil e **expiração de sessão**: qualquer resposta `401` remove o token e redireciona ao login.

### Emergência Imediata

- Botão de destaque na tela inicial, acionado com **um toque seguido de confirmação** ("Confirmar Emergência?" → "ENVIAR AGORA"), para evitar acionamentos acidentais.
- **Captura obrigatória de GPS:** a API exige localização, então sem ela o envio não acontece e o usuário recebe uma mensagem clara pedindo para ativar a localização.

### Fluxo guiado por órgão (PM, SAMU, Bombeiros)

1. **Seleção da ocorrência:** catálogo dinâmico carregado de `GET /api/v1/ocorrencias?orgao=`. Se a API estiver indisponível, usa um **fallback local** com as **33 ocorrências oficiais**, espelho do seed do banco: 11 por órgão, incluindo "Outro / Não sei informar".
2. **Resumo:** órgão e ocorrência escolhidos, **geolocalização** (latitude, longitude e precisão, com aviso de baixa precisão acima de 100 m) e campo de **detalhe adicional** opcional (até 500 caracteres).
3. **Envio** com feedback visual de carregamento e erro, com opção de tentar novamente.

### Confirmação e acompanhamento em tempo real

- Tela **"Solicitação registrada"** com órgão, ocorrência, coordenadas, horário e código da simulação (`#SIM-<id>`).
- **Acompanhamento** com linha do tempo atualizada por **polling automático a cada 5 s**, refletindo as transições `CRIADO` → `ENCAMINHADO_SIMULADO` → `ENCERRADO`.
  - O polling para sozinho quando o chamado é encerrado ou em erros 4xx.
  - Não dispara requisições sobrepostas.
  - Pausa com a aba em segundo plano.

### Histórico de solicitações

- Lista do mais recente ao mais antigo, com **paginação por cursor** (`{ itens, proximoCursor }`) e botão "Carregar mais".
- Status em linguagem simples: em azul se em andamento, em cinza se encerrado. Cada item leva ao acompanhamento.

### Contatos de confiança

- **CRUD completo** integrado à API (`/api/v1/contatos-confianca`): listar, adicionar, editar e remover, com confirmação na própria lista.
- **Modal de aviso rápido** ("Avisar contato") na tela inicial para escolher um contato e escrever uma mensagem. *O compartilhamento nativo ainda é simulado.*

### Perfil

- Tela dedicada com avatar, nome, e-mail e CPF mascarado (`***.456.789-**`).
- **Edição local** de nome e e-mail, salva apenas no aparelho, e **simulação de troca de senha** com validação Zod. A interface informa explicitamente que se trata de simulação.
- Acesso à gestão de contatos e saída da conta.

---

## Arquitetura, segurança e acessibilidade

### Estrutura de diretórios

```text
src/
├── api/          # Instância do Axios (baseURL, interceptors de JWT e de erros)
├── assets/       # Logotipo oficial (original e versão otimizada)
├── components/   # Componentes reutilizáveis
│   ├── chamados/ #   overlay de envio, cabeçalho do órgão, linhas de resumo
│   ├── contatos/ #   modal "Avisar contato"
│   ├── layout/   #   menu inferior e layout das telas de entrada
│   └── ui/       #   Input, Button e logotipo acessíveis
├── features/     # Módulos de domínio: services, schemas Zod, dados e formulários
│   ├── auth/     #   login, cadastro e sessão por usuário
│   ├── chamados/ #   contrato da API, órgãos, ocorrências, status, ícones
│   ├── contatos/ #   CRUD e formulário de contato
│   └── perfil/   #   meus dados e alteração de senha
├── hooks/        # Estado e regras de uso: useChamados, useContatos, useOcorrencias
├── pages/        # Uma tela por rota
├── routes/       # Definição das rotas e ProtectedRoute
├── services/     # Adaptadores de plataforma (geolocalização, pronto para Capacitor)
├── types/        # Tipos compartilhados (RFC 7807)
└── utils/        # Formatação e tratamento de erros
```

**Rotas:**

| Rota | Tela | Acesso |
| --- | --- | --- |
| `/login`, `/cadastro` | Entrada | Pública |
| `/` | Início | Autenticado |
| `/ocorrencias/:orgaoId` → `/resumo` | Fluxo guiado por órgão | Autenticado |
| `/chamado/:id/registrado`, `/chamado/:id/acompanhamento` | Confirmação e acompanhamento | Autenticado |
| `/historico` | Histórico | Autenticado |
| `/perfil`, `/contatos` | Perfil e contatos de confiança | Autenticado |

### Resiliência HTTP e segurança

- **Interceptors de JWT:** o token é injetado como `Authorization: Bearer <token>` em toda requisição. Um `401` encerra a sessão, exceto no próprio login, onde significa credenciais inválidas.
- **Erros no padrão RFC 7807 (`ProblemDetail`):** toda falha é normalizada para um único formato (`status`, `code`, `detail`, `errors[]`).
  - As mensagens de negócio do back-end chegam à tela (por exemplo, "A ocorrência informada não é válida para o órgão").
  - Erros de campo aparecem sob o campo correspondente do formulário.
  - Falhas de rede viram mensagens amigáveis.
- **`Idempotency-Key`:** cada chamado é enviado com uma chave UUID v4.
  - **Reaproveitamento inteligente:** após falha *ambígua* (rede, timeout ou 5xx), a nova tentativa reutiliza a mesma chave e o mesmo payload, para que o servidor não registre o chamado em duplicidade. Após sucesso ou erro 4xx, a chave é descartada.
  - Toques repetidos durante um envio são ignorados.
- **Privacidade:** o CPF só é exibido mascarado. Os contratos da API são tipados a partir dos records Java, evitando divergência de campos.

### Acessibilidade (WCAG)

- **Contraste:** a saudação e os textos principais sobre o fundo `#121933` atingem nível **AAA** (branco 17,3:1 e `slate-300` 11,7:1). As cores dos órgãos foram ajustadas para que o texto branco sobre elas atinja **no mínimo AA**:

  | Cor | Uso | Valor |
  | --- | --- | --- |
  | Azul | Polícia Militar | `#3563E8` |
  | Vermelho | SAMU e emergência | `#DC2626` |
  | Laranja | Corpo de Bombeiros | `#C2410C` |
  | Verde | Contatos | `#047857` |

- **Alvos de toque amplos:** botões principais com no mínimo 48–56 px de altura. Os cards de órgão são grandes e quadrados.
- **Navegação por teclado:** anel de foco visível em todos os controles, diálogos com foco inicial e fechamento por `Esc`, e menu inferior com `aria-current`.
- **Leitores de tela:**
  - regiões `aria-live` anunciam erros, carregamentos e mudanças de status do chamado;
  - os campos têm `label` associado, com `aria-invalid` e `aria-errormessage`;
  - os ícones decorativos usam `aria-hidden`.
- **Comunicação visual direta:** textos curtos, ícones reconhecíveis por categoria, estados explícitos ("Obtendo localização…", "Localização obtida") e nenhuma dependência de áudio.
- Respeita `prefers-reduced-motion` nas animações.

---

## Pré-requisitos e como executar localmente

### Pré-requisitos

- **Node.js** 20.19+ ou 22.12+ (exigência do Vite 8) e npm.
- **Back-end SINAL (Spring Boot)** em execução em `http://localhost:8080`, com o banco migrado (o seed de ocorrências é aplicado pelas migrations).
- Navegador com suporte a geolocalização. Em `localhost` a API de localização funciona sem HTTPS.

### Configuração

Crie o arquivo `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

```dotenv
VITE_API_URL=http://localhost:8080
```

> Sem a variável, o cliente HTTP usa `http://localhost:8080` como padrão. Reinicie o `npm run dev` após alterar o `.env.local` ou o `tailwind.config.js`.

### Comandos

```bash
npm install       # instala as dependências
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build     # checagem de tipos (tsc -b) + build de produção em dist/
npm run lint      # análise estática com Oxlint
npm run preview   # serve localmente o build de produção
```

---

## Integração com a API

| Método | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Login (retorna `accessToken`) |
| `POST` | `/api/v1/usuarios` | Cadastro |
| `GET` | `/api/v1/ocorrencias?orgao=` | Catálogo de ocorrências por órgão |
| `POST` | `/api/v1/chamados` | Chamado guiado (`Idempotency-Key` obrigatório) |
| `POST` | `/api/v1/chamados/emergencia-imediata` | Emergência Imediata (`Idempotency-Key` obrigatório) |
| `GET` | `/api/v1/chamados?limite=&cursor=` | Histórico paginado por cursor |
| `GET` `POST` `PUT` `DELETE` | `/api/v1/contatos-confianca[/{id}]` | Contatos de confiança |

---

## Limitações conhecidas

- **Acompanhamento:** o back-end não expõe `GET /api/v1/chamados/{id}`. O acompanhamento localiza o chamado no histórico, percorrendo até 5 páginas de 20 itens.
- **Perfil:** não há endpoints de perfil nem de troca de senha. A edição de dados é local e a troca de senha é simulada.
- **Compartilhamento com contato:** o compartilhamento nativo (SMS/WhatsApp) ainda não está implementado.
- **IDs do catálogo local:** os IDs do fallback correspondem a um banco recém-migrado. Em uso normal, o catálogo vem da API.

---

## Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE).
