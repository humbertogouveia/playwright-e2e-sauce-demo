import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';

let loginPage: LoginPage;

test.beforeEach(async({page})=>{
    loginPage = new LoginPage(page);
})

// O formulário de login da Sauce Demo também é protegido por hCaptcha, que
// bloqueia o envio feito por automação. O cenário fica documentado e marcado
// como fixme até existir um ambiente sem captcha (ou com as chaves de teste do hCaptcha).
test.fixme('Realizar login com sucesso', async ({page}) => {
    await test.step('Dado que acesso a página de login',async ()=>{
        await loginPage.acessarPaginaDeLogin()
        await expect(page).toHaveURL('/account/login')
    })
    await test.step('Quando preencho os campos obrigatórios',async()=>{
        await loginPage.preencherCamposDeLogin(process.env.USER_EMAIL!, process.env.USER_PASSWORD!)
    })
    await test.step('E clico no botão SignIn',async()=>{
        await loginPage.clicarNoBotaoSignIn()
    })
    await test.step('Então o login é realizado com sucesso',async()=>{
        await expect(page).toHaveURL(/\/account$/);
        await expect(loginPage.linkLogout).toBeVisible();
    })
})

// Mesmo bloqueio do login com sucesso: a mensagem "Incorrect email or password."
// vem do servidor, e o hCaptcha impede o envio do formulário pela automação.
test.fixme('Não permitir login com campos em branco', async ({page}) => {
    await test.step('Dado que acesso a página de login',async ()=>{
        await loginPage.acessarPaginaDeLogin()
        await expect(page).toHaveURL('/account/login')
    })
    await test.step('Quando não preencho os campos obrigatórios',async()=>{
        await loginPage.preencherCamposDeLogin('','')
    })
    await test.step('E clico no botão SignIn',async()=>{
        await loginPage.clicarNoBotaoSignIn()
    })
    await test.step('Então o login não é realizado',async()=>{
        await expect(page.getByText('Incorrect email or password.')).toBeVisible();
        await expect(page).toHaveURL(/\/account\/login$/);
        await expect(loginPage.linkLogout).not.toBeVisible();
    })
})

test('Não permitir login com e-mail em formato inválido', async ({page}) => {
    await test.step('Dado que acesso a página de login',async ()=>{
        await loginPage.acessarPaginaDeLogin()
        await expect(page).toHaveURL('/account/login')
    })
    await test.step('Quando preencho o login com um e-mail sem domínio',async()=>{
        await loginPage.preencherCamposDeLogin('teste@','senha123')
    })
    await test.step('E clico no botão SignIn',async()=>{
        await loginPage.clicarNoBotaoSignIn()
    })
    await test.step('Então o navegador aponta o e-mail como inválido e o login não é enviado',async()=>{
        expect(await loginPage.emailEstaValido()).toBe(false);
        expect(await loginPage.mensagemDeValidacaoDoEmail()).not.toBe('');
        await expect(page).toHaveURL(/\/account\/login$/);
        await expect(loginPage.linkLogout).not.toBeVisible();
    })
})
