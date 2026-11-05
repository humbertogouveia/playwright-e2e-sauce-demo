import {Page,Locator} from '@playwright/test'
import { BasePage } from './basePage'

export class CadastroPage extends BasePage {
    readonly tituloCadastro: Locator;
    readonly formCadastro: Locator;
    readonly inputNome: Locator;
    readonly inputSobrenome: Locator;
    readonly inputEmail: Locator;
    readonly inputSenha: Locator;
    readonly botaoCriar: Locator;

    constructor(page:Page){
        super(page);

        this.tituloCadastro = page.getByRole('heading', { name: 'Create Account' });
        // A página repete os ids (first_name, email...) fora do formulário,
        // então o <label for> não aponta para estes campos e getByLabel não funciona.
        // Por isso a busca é limitada ao formulário de cadastro e usa o atributo name.
        this.formCadastro = page.locator('#create_customer');
        this.inputNome = this.formCadastro.locator('input[name="customer[first_name]"]');
        this.inputSobrenome = this.formCadastro.locator('input[name="customer[last_name]"]');
        this.inputEmail = this.formCadastro.locator('input[name="customer[email]"]');
        this.inputSenha = this.formCadastro.locator('input[name="customer[password]"]');
        this.botaoCriar = this.formCadastro.getByRole('button', { name: 'Create' });
    }

    async preencherFormulario(nome:string,sobrenome:string,email:string,senha:string){
        await this.inputNome.fill(nome)
        await this.inputSobrenome.fill(sobrenome)
        await this.inputEmail.fill(email)
        await this.inputSenha.fill(senha)
    }

    async clicarNoBotaoCreate() {
        await this.botaoCriar.click()
    }

    // O campo de e-mail é type="email": o próprio navegador valida o formato
    // e bloqueia o envio antes do hCaptcha. A mensagem fica em validationMessage.
    async mensagemDeValidacaoDoEmail(): Promise<string> {
        return this.inputEmail.evaluate((campo: HTMLInputElement) => campo.validationMessage)
    }
}