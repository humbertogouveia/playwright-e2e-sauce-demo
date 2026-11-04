import {test,expect} from '@playwright/test'
import { HomePage } from '../pages/homePage'
import { CadastroPage } from '../pages/cadastroPage'
import { criarCliente } from '../support/factories/clienteComDadosValidos'

let homePage: HomePage
let cadastroPage: CadastroPage

test.beforeEach(async ({page})=>{
  homePage = new HomePage(page)
  cadastroPage = new CadastroPage(page)
  await homePage.acessarAplicacao()
})

test('Acessar o formulário de cadastro pela Home',async({page}) =>{
  await test.step('Dado que estou na Home', async ()=>{
    await expect(homePage.tituloHome).toBeVisible()
  })

  await test.step('Quando clico em Sign up', async ()=>{
    await homePage.acessarSignup()
  })

  await test.step('Então vejo o formulário de cadastro com todos os campos', async ()=>{
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
test.fixme('Realizar cadastro com dados válidos',async({page}) =>{
  const clienteValido = criarCliente()

  await test.step('Dado que estou na página de cadastro',async() =>{
    await homePage.acessarSignup();
    await expect(cadastroPage.tituloCadastro).toBeVisible()
  })

  await test.step('Quando envio o cadastro com dados válidos', async ()=>{
    await cadastroPage.realizarCadastroDeUsuario(
      clienteValido.nome,
      clienteValido.sobrenome,
      clienteValido.email,
      clienteValido.senha
    );
  })

  await test.step('Então sou redirecionado para a minha conta',async()=>{
    await expect(page).toHaveURL('/account')
  })
})
