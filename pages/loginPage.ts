import { Page, Locator } from "@playwright/test";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {
    readonly inputEmail: Locator = this.page.getByRole('textbox', { name: 'Email Address' });
    readonly inputSenha: Locator = this.page.getByRole('textbox', { name: 'Password' });
    readonly botaoSignIn: Locator = this.page.getByRole('button', { name: 'Sign In' });
    readonly linkLogout: Locator = this.page.getByRole('link', { name: 'Log out' });

    constructor(page: Page) {
        super(page);
    }

    async acessarPaginaDeLogin() {
        await this.page.goto('/account/login')
    }

    async preencherCamposDeLogin(email: string, senha: string) {
        await this.inputEmail.fill(email)
        await this.inputSenha.fill(senha)
    }

    async clicarNoBotaoSignIn() {
        await this.botaoSignIn.click()
    }

    // O campo de e-mail é type="email": o próprio navegador valida o formato
    // e bloqueia o envio antes do hCaptcha.
    async emailEstaValido(): Promise<boolean> {
        return this.inputEmail.evaluate((campo: HTMLInputElement) => campo.validity.valid)
    }

    async mensagemDeValidacaoDoEmail(): Promise<string> {
        return this.inputEmail.evaluate((campo: HTMLInputElement) => campo.validationMessage)
    }
}
