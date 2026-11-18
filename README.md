# 🎭 Automação E2E com Playwright — Sauce Demo

![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Projeto de estudo e portfólio de **automação de testes end-to-end** usando **Playwright + TypeScript** contra a loja de demonstração [Sauce Demo (Shopify)](https://sauce-demo.myshopify.com/).

O objetivo é mostrar, num projeto pequeno e organizado, as práticas que uso no dia a dia como QA: **Page Object Model**, cenários no formato **Dado / Quando / Então**, massa de dados dinâmica, seletores resilientes, variáveis de ambiente e execução contínua em **pipeline de CI**.

---

## 📌 Sumário

- [Sobre a aplicação testada](#-sobre-a-aplicação-testada)
- [Tecnologias](#-tecnologias)
- [Arquitetura do projeto](#-arquitetura-do-projeto)
- [Boas práticas aplicadas](#-boas-práticas-aplicadas)
- [Cenários automatizados](#-cenários-automatizados)
- [Limitação conhecida: hCaptcha](#-limitação-conhecida-hcaptcha)
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
- Busca de produtos (`/search`)

---

## 🧰 Tecnologias

| Ferramenta | Uso |
|---|---|
| [Playwright Test](https://playwright.dev/) | Framework de testes E2E, runner e asserções |
| TypeScript | Tipagem estática nos testes e Page Objects |
| [@faker-js/faker](https://fakerjs.dev/) | Geração de massa de dados dinâmica |
| [dotenv](https://github.com/motdotla/dotenv) | Leitura de credenciais a partir do `.env` |
| Node.js (LTS) | Ambiente de execução |
| GitHub Actions | Pipeline de CI a cada push/PR |
| HTML Reporter | Relatório visual das execuções |

---

## 🏗️ Arquitetura do projeto

```
playwright-e2e-sauce-demo/
├── .github/
│   └── workflows/
│       └── playwright.yml               # Pipeline de CI
├── pages/                               # Page Objects
│   ├── basePage.ts                      # Classe base: Page compartilhada + navegação para a Home
│   ├── homePage.ts                      # Home, página de produto, busca e carrinho
│   ├── catalogoPage.ts                  # Página de coleção: grade, preços e selo "Sold Out"
│   ├── produtoPage.ts                   # Página de detalhes do produto (PDP)
│   ├── carrinhoPage.ts                  # Contador do cabeçalho, itens e total do carrinho
│   ├── cadastroPage.ts                  # Formulário de cadastro
│   └── loginPage.ts                     # Formulário de login
├── support/
│   ├── data/
│   │   └── produtosCatalogo.ts          # Massa fixa dos produtos do catálogo
│   └── factories/
│       └── clienteComDadosValidos.ts    # Factory de cliente com Faker
├── tests/
│   ├── cadastro.spec.ts                 # Cenários de cadastro
│   ├── catalogo.spec.ts                 # Cenários da página de coleção
│   ├── login.spec.ts                    # Cenários de login
│   └── home.spec.ts                     # Cenários de produto, busca e carrinho
├── .env.example                         # Modelo das variáveis de ambiente
├── playwright.config.ts                 # Configuração central (baseURL, retries, trace, dotenv)
└── package.json                         # Dependências e scripts npm
```

### Page Object Model com herança

Todas as páginas herdam de uma `BasePage`, que guarda a instância de `Page` e a navegação comum. Cada Page Object declara só os próprios locators e ações.

```ts
// pages/basePage.ts
export class BasePage {
  constructor(protected readonly page: Page) {}

  async acessarAplicacao() {
    await this.page.goto('/')
  }
}
```

As Pages **devolvem locators** e executam **ações**; as **verificações** (`expect`) ficam na spec. Assim a Page sabe *onde* estão os elementos, e o teste decide *o que* validar.

```ts
// pages/homePage.ts
async acessarProdutoPeloNome(nome: string) {
  await this.page.getByRole('heading', { name: nome, exact: true }).click()
}

nomeDoProduto(nome: string): Locator {
  return this.page.getByRole('heading', { level: 1, name: nome, exact: true })
}

precoDoProduto(preco: string): Locator {
  return this.page.getByRole('heading', { level: 2, name: preco, exact: true })
}
```

### Cenários em Dado / Quando / Então com `test.step`

Os testes seguem a estrutura do BDD sem depender de Cucumber: cada etapa é um `test.step`, que aparece separado no relatório HTML e no Trace Viewer.

```ts
// tests/home.spec.ts
const produto = { nome: 'Grey jacket', preco: '£55.00', slug: 'grey-jacket' }

test('Acessar a página de um produto pela Home', async ({ page }) => {
  await test.step('Dado que acesso a página inicial', async () => {
    await homePage.acessarAplicacao()
    await expect(homePage.tituloHome).toBeVisible()
  })

  await test.step(`Quando clico no produto ${produto.nome}`, async () => {
    await homePage.acessarProdutoPeloNome(produto.nome)
  })

  await test.step('Então vejo a página do produto com nome, preço e imagem', async () => {
    await expect(page).toHaveURL(new RegExp(`/products/${produto.slug}$`))
    await expect(homePage.nomeDoProduto(produto.nome)).toBeVisible()
    await expect(homePage.precoDoProduto(produto.preco)).toBeVisible()
    await expect(homePage.imagemDoProduto()).toBeVisible()
  })
})
```

### Massa de dados com factory

A factory `criarCliente` gera um cliente novo a cada execução, o que evita falhas por "e-mail já cadastrado". O parâmetro `sobrescrever` permite montar cenários negativos mudando só o campo que interessa.

```ts
// support/factories/clienteComDadosValidos.ts
const clienteValido = criarCliente()
const clienteComEmailInvalido = criarCliente({ email: 'teste@' })
const clienteSemEmailESenha = criarCliente({ email: '', senha: '' })
```

### Testes data-driven a partir de uma massa fixa

Os produtos do catálogo ficam em `support/data/produtosCatalogo.ts`, com nome, preço, slug e se estão esgotados. A spec percorre essa lista e gera um teste por produto, cada um com nome próprio no relatório. Se a loja mudar um preço ou um produto, basta atualizar a lista.

```ts
// tests/catalogo.spec.ts
for (const produto of produtosCatalogo) {
  test(`Exibir nome e preço do produto ${produto.nome}`, { tag: ['@smoke', '@colecao'] }, async () => {
    await test.step(`Então devo ver o produto "${produto.nome}" com o preço "${produto.preco}"`, async () => {
      await expect(catalogoPage.cardDoProduto(produto.nome)).toBeVisible()
      await expect(catalogoPage.precoNoCard(produto.nome)).toHaveText(produto.preco)
    })
  })
}
```

---

## ✅ Boas práticas aplicadas

- **Page Object Model + herança**: separa a interação com a tela da lógica de teste e facilita a manutenção quando a UI muda.
- **Locators acessíveis (`getByRole`)** sempre que a página permite. Quando não permite, a escolha é documentada no código. Exemplo: o formulário de cadastro repete ids fora do formulário, então o `<label for>` não aponta para os campos. Por isso os locators ficam limitados a `#create_customer` e usam o atributo `name`.
- **Métodos parametrizados**: `acessarProdutoPeloNome(nome)`, `preencherFormulario(...)` e `preencherCamposDeLogin(email, senha)` servem para cenários positivos e negativos.
- **Ações separadas por etapa**: preencher e enviar são métodos distintos, o que deixa cada `test.step` com uma única responsabilidade.
- **Massa dinâmica com Faker** e factory com sobrescrita de campos.
- **Testes data-driven**: uma lista de produtos gera um teste por item, sem duplicar código.
- **Tags** (`@smoke`, `@estoque`, `@e2e`, `@navegacao`...) para rodar só um grupo de cenários com `--grep`.
- **Locators que refletem o comportamento real da tela**: o link "My Cart (n)" tem `href="#"` e só abre o mini-carrinho, então a navegação para `/cart` usa o link "Check Out". O "Remove" do mini-carrinho fica oculto, então a remoção usa o link "x" visível na página do carrinho.
- **Credenciais fora do código**: lidas de `USER_EMAIL` e `USER_PASSWORD` via `dotenv`. O `.env` fica no `.gitignore`, e o `.env.example` documenta as variáveis.
- **`baseURL` centralizada**: os testes navegam com caminhos relativos (`/`, `/account/login`).
- **Web-first assertions** (`toBeVisible`, `toHaveURL`, `toHaveText`) com retry automático, sem `sleep` nem esperas fixas.
- **Testes que podem falhar**: cada cenário novo foi validado também com dados errados, para descartar falsos positivos.
- **Configuração sensível ao CI**:
  - `forbidOnly`: impede que um `test.only` esquecido vá para o pipeline;
  - `retries: 2` só em CI;
  - `trace: 'on-first-retry'` para investigar instabilidade sem pesar a execução.
- **Execução paralela** (`fullyParallel: true`) para feedback rápido.
- **Conventional Commits** e fluxo de **feature branch + Pull Request**.

---

## 🧪 Cenários automatizados

Legenda: ✅ executado na suíte · ⏸️ implementado e marcado como `fixme` (ver [hCaptcha](#-limitação-conhecida-hcaptcha))

### Cadastro: `tests/cadastro.spec.ts`

| Cenário | Status |
|---|---|
| Acessar o formulário de cadastro e validar título, campos editáveis e botão habilitado | ✅ |
| Não permitir cadastro com e-mail em formato inválido (validação nativa do navegador) | ✅ |
| Realizar cadastro com dados válidos | ⏸️ |
| Não permitir cadastro com e-mail e senha em branco | ⏸️ |

### Login: `tests/login.spec.ts`

| Cenário | Status |
|---|---|
| Não permitir login com e-mail em formato inválido (validação nativa do navegador) | ✅ |
| Realizar login com sucesso (credenciais via `.env`) | ⏸️ |
| Não permitir login com campos em branco | ⏸️ |

### Home, produto e busca: `tests/home.spec.ts`

| Cenário | Status |
|---|---|
| Acessar a página de um produto pela Home e validar URL, nome, preço e imagem | ✅ |
| Acessar a busca pelo cabeçalho e validar a mensagem de busca não realizada | ✅ |
| Adicionar um produto ao carrinho e validar o contador de itens no cabeçalho | ✅ |
| Remover um produto do carrinho e validar o contador zerado | ✅ |

### Catálogo: `tests/catalogo.spec.ts`

| Cenário | Testes | Tags | Status |
|---|---|---|---|
| Exibir a página de coleção (título, breadcrumb e quantidade de produtos) | 1 | `@smoke` `@colecao` | ✅ |
| Exibir nome e preço de cada produto da grade | 7 | `@smoke` `@colecao` | ✅ |
| Exibir o selo "Sold Out" só nos produtos esgotados | 7 | `@regra-negocio` `@estoque` | ✅ |
| Abrir a página de detalhes do produto a partir da coleção | 3 | `@navegacao` | ✅ |
| Adicionar ao carrinho um produto disponível e validar contador, item e total | 1 | `@e2e` `@carrinho` | ✅ |
| Impedir a compra de um produto esgotado (botão "Sold Out" desabilitado) | 1 | `@negativo` `@estoque` | ✅ |

> O slug do produto "Black heels" é `flower-print-jeans`. A página do produto mostra os dados certos, então não é um defeito, mas o teste de navegação confere o título da página além da URL.

**Resultado atual da suíte:** 27 passed · 4 skipped (fixme)

---

## 🔒 Limitação conhecida: hCaptcha

Os formulários de **cadastro** e **login** da Sauce Demo são protegidos por **hCaptcha**, que bloqueia o envio feito por automação. Por isso:

- cenários que dependem da **resposta do servidor** (cadastro concluído, login realizado, mensagens como `Email can't be blank.` ou `Incorrect email or password.`) estão implementados, mas marcados como `test.fixme`, com um comentário explicando o motivo;
- a validação de **formato de e-mail** é feita pelo próprio navegador (`type="email"`) **antes** do envio, então é testada de forma estável pela propriedade `validity` do campo;
- o teste verifica que a mensagem de validação existe, mas não compara o texto exato, que muda conforme o navegador e o idioma.

Em um projeto real, o caminho seria desativar o captcha no ambiente de teste ou usar as chaves de teste do hCaptcha. Contornar o captcha não faz parte do escopo deste projeto.

---

## ▶️ Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) LTS
- npm

### Instalação

```bash
git clone https://github.com/humbertogouveia/playwright-e2e-sauce-demo.git
cd playwright-e2e-sauce-demo
npm ci
npx playwright install --with-deps
```

### Variáveis de ambiente (opcional)

Usadas apenas pelo cenário de login com sucesso, hoje em `fixme`:

```bash
cp .env.example .env
# preencha USER_EMAIL e USER_PASSWORD com uma conta de teste
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm test` | Executa todos os testes em modo headless |
| `npm run test:chromium` | Executa somente no projeto Chromium |
| `npm run test:ui` | Abre o **UI Mode** do Playwright (execução interativa, time travel) |
| `npm run test:debug` | Executa com o **Playwright Inspector** para depuração passo a passo |
| `npm run test:report` | Abre o último relatório HTML |
| `npm run codegen` | Abre o **Codegen** na loja para gravar interações e gerar locators |

### Scripts por spec

Cada arquivo de `tests/` tem um script próprio, para rodar só a funcionalidade em que você está trabalhando:

| Comando | Spec executada | Cobertura |
|---|---|---|
| `npm run test:cadastro` | `tests/cadastro.spec.ts` | Formulário de cadastro |
| `npm run test:catalogo` | `tests/catalogo.spec.ts` | Página de coleção, estoque e carrinho a partir do catálogo |
| `npm run test:home` | `tests/home.spec.ts` | Home, página de produto, busca e carrinho |
| `npm run test:login` | `tests/login.spec.ts` | Formulário de login |

Os scripts aceitam as opções do Playwright depois de `--`:

```bash
npm run test:catalogo -- --headed              # com o navegador visível
npm run test:home -- --project=chromium        # só no Chromium
npm run test:login -- --debug                  # com o Playwright Inspector
```

Para rodar outras partes da suíte:

```bash
npx playwright test -g "formato inválido"     # pelo título do cenário
npx playwright test --grep @smoke             # por tag
```

---

## 🔄 Integração contínua

O workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) roda a cada **push** e **pull request** para `main`:

1. Checkout do código
2. Setup do Node.js LTS
3. `npm ci` (instalação reprodutível pelo lockfile)
4. Instalação dos browsers do Playwright e dependências do sistema
5. Execução da suíte. Cenários em `fixme` são contados como *skipped* e não quebram o build
6. Publicação do **relatório HTML como artefato** (retido por 30 dias), mesmo quando há falhas

---

## 📊 Relatórios e debug

- **HTML Report**: gerado em `playwright-report/` a cada execução (`npm run test:report`), com cada `test.step` listado separadamente.
- **Trace Viewer**: em caso de retry, o trace fica disponível no relatório com timeline, snapshots do DOM, rede e console.
- **UI Mode / Inspector**: para desenvolver e depurar testes localmente.

---

## 🗺️ Roadmap

**Cenários**
- [x] Acesso ao formulário de cadastro
- [x] Validação de e-mail inválido no cadastro e no login
- [x] Página de produto pela Home (nome, preço e imagem)
- [x] Acesso à busca
- [x] Busca por termo com resultado e sem resultado
- [x] Adicionar produto ao carrinho e validar o contador de itens
- [x] Remover produtos do carrinho e validar totais
- [x] Navegação pelo catálogo (grade, preços, página de produto)
- [x] Indicação de produtos esgotados e bloqueio da compra
- [ ] Reativar cadastro e login completos em um ambiente sem captcha

**Técnicas**
- [x] Page Object Model com herança
- [x] Cenários Dado / Quando / Então com `test.step`
- [x] Geração de massa de dados com Faker
- [x] Variáveis de ambiente com `dotenv`
- [ ] Fixtures customizadas para injetar os Page Objects nos testes
- [x] Testes data-driven (lista de produtos)
- [x] Scripts npm por spec
- [x] Tags nos cenários (`@smoke`, `@estoque`, `@e2e`...)
- [ ] Reaproveitar sessão autenticada com `storageState`
- [ ] Execução cross-browser (Firefox, WebKit) e viewports mobile
- [ ] Filtrar suítes por tag no CI (ex.: `@smoke` a cada push)
- [ ] Screenshot e vídeo em falhas
- [ ] Publicação do relatório no GitHub Pages

---

## 👤 Autor

**Humberto Dente Gouveia** — QA Sênior | Automação de Testes

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/humberto-gouveia/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/humbertogouveia)

---

Distribuído sob a licença [MIT](LICENSE).

> Projeto com fins de estudo. A aplicação testada é uma loja de demonstração pública e não tem relação com este repositório.
