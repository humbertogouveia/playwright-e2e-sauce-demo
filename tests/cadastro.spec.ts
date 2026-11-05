import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/homePage'
import { CadastroPage } from '../pages/cadastroPage'
import { criarCliente } from '../support/factories/clienteComDadosValidos'

let homePage: HomePage
let cadastroPage: CadastroPage

test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page)
  cadastroPage = new CadastroPage(page)
  await homePage.acessarAplicacao()
})

test('Acessar o formulário de cadastro pela Home', async ({ page }) => {
  await test.step('Dado que estou na Home', async () => {
    await expect(homePage.tituloHome).toBeVisible()
  })

  await test.step('Quando clico em Sign up', async () => {
    await homePage.acessarSignup()
  })

  await test.step('Então vejo o formulário de cadastro com todos os campos', async () => {
    await expect(page).toHaveURL('/account/register')
    await expect(cadastroPage.tituloCadastro).toBeVisible()
    await expect(cadastroPage.inputNome).toBeEditable()
    await expect(cadastroPage.inputSobrenome).toBeEditable()
    await expect(cadastroPage.inputEmail).toBeEditable()
    await expect(cadastroPage.inputSenha).toBeEditable()
    await expect(cadastroPage.botaoCriar).toBeEnabled()
  })
})

// O formulário de cadastro da Sauce Demo é protegido por hCaptcha, que bloqueia
// o envio feito por automação. O cenário fica documentado e marcado como fixme
// até existir um ambiente sem captcha (ou com as chaves de teste do hCaptcha).
test.fixme('Realizar cadastro com dados válidos', async ({ page }) => {
  const clienteValido = criarCliente()

  await test.step('Dado que estou na página de cadastro', async () => {
    await homePage.acessarSignup();
    await expect(cadastroPage.tituloCadastro).toBeVisible()
  })

  await test.step('Quando preencho o cadastro com dados válidos', async () => {
    await cadastroPage.preencherFormulario(
      clienteValido.nome,
      clienteValido.sobrenome,
      clienteValido.email,
      clienteValido.senha
    );
  })

  await test.step('E clico no botão Create', async () => {
    await cadastroPage.clicarNoBotaoCreate()
  })

  await test.step('Então sou redirecionado para a minha conta', async () => {
    await expect(page).toHaveURL('/account')
  })
})

// O formulário de cadastro da Sauce Demo é protegido por hCaptcha, que bloqueia
// o envio feito por automação. O cenário fica documentado e marcado como fixme
// até existir um ambiente sem captcha (ou com as chaves de teste do hCaptcha).
test.fixme('Não permitir cadastro com dados ausentes ou inválidos', async ({ page }) => {
  const clienteSemEmailESenha = criarCliente({email:'',senha:''})

  await test.step('Dado que estou na tela de cadastro', async () => {
    await homePage.acessarSignup();
  })

  await test.step('Quando não preencho os campos obrigatórios de senha e email', async () => {
    await cadastroPage.preencherFormulario(
      clienteSemEmailESenha.nome,
      clienteSemEmailESenha.sobrenome,
      clienteSemEmailESenha.email,
      clienteSemEmailESenha.senha
    );
    
  })

  await test.step('E clico no botão Create',async()=>{
    await cadastroPage.clicarNoBotaoCreate()
  })

  await test.step('Então visualizo os avisos que e-mail e senha não devem estar em branco',async()=>{
    await expect(page.getByText("Email can't be blank.")).toBeVisible()
    await expect(page.getByText("Password can't be blank.")).toBeVisible()
  })
})

test('Não permitir cadastro com e-mail em formato inválido', async ({ page }) => {
  const clienteComEmailInvalido = criarCliente({ email: 'teste@' })

  await test.step('Dado que estou na tela de cadastro', async () => {
    await homePage.acessarSignup()
    await expect(cadastroPage.tituloCadastro).toBeVisible()
  })

  await test.step('Quando preencho o cadastro com um e-mail sem domínio', async () => {
    await cadastroPage.preencherFormulario(
      clienteComEmailInvalido.nome,
      clienteComEmailInvalido.sobrenome,
      clienteComEmailInvalido.email,
      clienteComEmailInvalido.senha
    )
  })

  await test.step('E clico no botão Create', async () => {
    await cadastroPage.clicarNoBotaoCreate()
  })

  await test.step('Então o navegador aponta o e-mail como inválido e o cadastro não é enviado', async () => {
    const valido = await cadastroPage.inputEmail.evaluate((campo: HTMLInputElement) => campo.validity.valid)
    expect(valido).toBe(false)
    expect(await cadastroPage.mensagemDeValidacaoDoEmail()).not.toBe('')
    await expect(page).toHaveURL('/account/register')
  })
})
