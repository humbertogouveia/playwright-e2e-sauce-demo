# 🎭 Automação E2E com Playwright — Sauce Demo

[![Playwright Tests](https://github.com/<seu-usuario>/estudo_playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/<seu-usuario>/estudo_playwright/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

Projeto de estudo e portfólio de **automação de testes end-to-end** usando **Playwright + TypeScript** contra a loja de demonstração [Sauce Demo (Shopify)](https://sauce-demo.myshopify.com/).

O objetivo é mostrar, num projeto pequeno e organizado, as práticas que uso no dia a dia como QA: arquitetura com **Page Object Model**, seletores resilientes, configuração centralizada e execução contínua em **pipeline de CI**.

---

## 📌 Sumário

- [Sobre a aplicação testada](#-sobre-a-aplicação-testada)
- [Tecnologias](#-tecnologias)
- [Arquitetura do projeto](#-arquitetura-do-projeto)
- [Boas práticas aplicadas](#-boas-práticas-aplicadas)
- [Cenários automatizados](#-cenários-automatizados)
- [Como executar](#-como-executar)
- [Integração contínua](#-integração-contínua)
- [Relatórios e debug](#-relatórios-e-debug)
- [Roadmap](#-roadmap)
- [Autor](#-autor)

---

## 🛒 Sobre a aplicação testada

O **Sauce Demo** é uma loja Shopify pública, feita para prática de automação. Ela tem os fluxos típicos de um e-commerce:

- Navegação pela home e pelo catálogo
- Cadastro e login de clientes (`/account/register`, `/account/login`)
- Página de produto, carrinho e checkout
- Busca de produtos

---

## 🧰 Tecnologias

| Ferramenta | Uso |
|---|---|
| [Playwright Test](https://playwright.dev/) | Framework de testes E2E, runner e asserções |
| TypeScript | Tipagem estática nos testes e Page Objects |
| Node.js (LTS) | Ambiente de execução |
| GitHub Actions | Pipeline de CI a cada push/PR |
| HTML Reporter | Relatório visual das execuções |

---

## 🏗️ Arquitetura do projeto

```
estudo_playwright/
├── .github/
│   └── workflows/
│       └── playwright.yml   # Pipeline de CI
├── pages/                   # Page Objects
│   ├── basePage.ts          # Classe base: Page compartilhada + ações comuns
│   └── homePage.ts          # Locators e ações da Home
├── tests/
│   └── cadastro.spec.ts     # Specs de teste
├── playwright.config.ts     # Configuração central (baseURL, retries, trace, browsers)
└── package.json             # Scripts npm
```

### Page Object Model com herança

As páginas herdam de uma `BasePage`, que guarda a instância de `Page` e as ações comuns a todas as telas. Assim cada Page Object só declara os próprios locators e ações, sem repetir código.

```ts
// pages/basePage.ts
export class BasePage {
  constructor(protected readonly page: Page) {}

  async acessarAplicacao() {
    await this.page.goto('/');
  }
}
```

```ts
// pages/homePage.ts
export class HomePage extends BasePage {
  readonly tituloHome: Locator;
  readonly linkTextSignup: Locator;

  constructor(page: Page) {
    super(page);
    this.tituloHome = page.getByRole('heading', { name: 'Sauce Demo' });
    this.linkTextSignup = page.getByRole('link', { name: 'Sign up' });
  }

  async acessarSignup() {
    await this.linkTextSignup.click();
  }
}
```

Os testes ficam enxutos e descrevem **comportamento**, não detalhes de implementação:

```ts
// tests/cadastro.spec.ts
test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page);
  await homePage.acessarAplicacao();
});

test('Realizar cadastro', async ({ page }) => {
  await homePage.acessarSignup();
  await expect(page).toHaveURL('/account/register');
});
```

---

## ✅ Boas práticas aplicadas

- **Page Object Model + herança**: separa a lógica de interação da lógica de teste e facilita a manutenção quando a UI muda.
- **Locators acessíveis (`getByRole`)**: seletores baseados em papel e nome acessível, mais estáveis que CSS/XPath e alinhados à forma como o usuário enxerga a página.
- **`baseURL` centralizada**: os testes navegam com caminhos relativos (`/`, `/account/register`), o que permite trocar de ambiente sem mexer nas specs.
- **Web-first assertions**: `expect(page).toHaveURL(...)` faz retry automático até a condição ser atendida, sem `sleep` nem esperas fixas.
- **Hooks (`beforeEach`)**: pré-condições comuns (abrir a aplicação) num só lugar.
- **Configuração sensível ao ambiente de CI**:
  - `forbidOnly` em CI: impede que um `test.only` esquecido vá para o pipeline.
  - `retries: 2` só em CI: reduz o ruído de instabilidade de rede sem esconder falhas no ambiente local.
  - `trace: 'on-first-retry'`: grava trace só quando o teste precisa de retry, para investigar flaky tests sem pesar a execução.
- **Execução paralela** (`fullyParallel: true`) para feedback rápido.
- **Scripts npm** padronizados para os modos de execução mais comuns.

---

## 🧪 Cenários automatizados

| Funcionalidade | Cenário | Status |
|---|---|---|
| Cadastro | Acessar o formulário de cadastro a partir da Home (link *Sign up*) e validar o redirecionamento para `/account/register` | ✅ |

> Os próximos cenários estão no [Roadmap](#-roadmap).

---

## ▶️ Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) LTS
- npm

### Instalação

```bash
git clone https://github.com/<seu-usuario>/estudo_playwright.git
cd estudo_playwright
npm ci
npx playwright install --with-deps
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm test` | Executa todos os testes em modo headless |
| `npm run test:chromium` | Executa somente no projeto Chromium |
| `npm run test:ui` | Abre o **UI Mode** do Playwright (execução interativa, time travel) |
| `npm run test:debug` | Executa com o **Playwright Inspector** para depuração passo a passo |
| `npm run test:report` | Abre o último relatório HTML |
| `npm run codegen` | Abre o **Codegen** para gravar interações e gerar locators |

---

## 🔄 Integração contínua

O workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) roda a cada **push** e **pull request** nas branches `main`/`master`:

1. Checkout do código
2. Setup do Node.js LTS
3. `npm ci` (instalação reprodutível pelo lockfile)
4. Instalação dos browsers do Playwright e dependências do sistema
5. Execução da suíte
6. Publicação do **relatório HTML como artefato** (retido por 30 dias), mesmo quando há falhas

---

## 📊 Relatórios e debug

- **HTML Report**: gerado em `playwright-report/` a cada execução (`npm run test:report`).
- **Trace Viewer**: em caso de retry, o trace fica disponível no relatório com timeline, snapshots do DOM, rede e console.
- **UI Mode / Inspector**: para desenvolver e depurar testes localmente.

---

## 🗺️ Roadmap

Próximos passos planejados para ampliar a cobertura e as técnicas do projeto:

**Cenários**
- [x] Cadastro completo com dados válidos (massa dinâmica)
- [x] Validações de cadastro: campos obrigatórios, e-mail inválido, e-mail já cadastrado
- [ ] Login com credenciais válidas e inválidas
- [ ] Busca de produtos (com e sem resultado)
- [ ] Adicionar e remover produtos do carrinho e validar totais
- [ ] Navegação pelo catálogo e página de produto

**Técnicas**
- [ ] Fixtures customizadas para injetar os Page Objects nos testes
- [ ] Geração de massa de dados (ex.: Faker)
- [ ] Reaproveitar sessão autenticada com `storageState`
- [ ] Variáveis de ambiente com `dotenv`
- [ ] Execução cross-browser (Firefox, WebKit) e viewports mobile
- [ ] Tags (`@smoke`, `@regression`) para filtrar suítes no CI
- [ ] Screenshot e vídeo em falhas
- [ ] Publicação do relatório no GitHub Pages

---

## 👤 Autor

**Humberto Dente Gouveia** — QA Sênior | Automação de Testes

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/<seu-linkedin>/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/<seu-usuario>)

---

> Projeto com fins de estudo. A aplicação testada é uma loja de demonstração pública e não tem relação com este repositório.
