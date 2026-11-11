import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './basePage'

export class HomePage extends BasePage {
    readonly tituloHome: Locator = this.page.getByRole('heading', { name: 'Sauce Demo' });
    readonly linkTextSignup: Locator = this.page.getByRole('link', { name: 'Sign up' });
    readonly linkTextLogin: Locator = this.page.getByRole('link', { name: 'Log in' });
    readonly mensagemDeBuscaSemResultados: Locator = this.page.getByText('No search performed. If you are looking for something, please try our homepage', { exact: true })
    readonly campoDeBusca: Locator = this.page.getByRole('banner').getByRole('link', { name: 'Search' })

    constructor(page: Page) {
        super(page);
    }

    async acessarSignup() {
        await this.page.goto('/account/register')
        await expect(this.page).toHaveTitle('Create Account – Sauce Demo')
    }

    async acessarProdutoPeloNome(nome: string) {
        await this.page.getByRole('heading', { name: nome, exact: true }).click()
    }

    nomeDoProduto(nome: string): Locator {
        return this.page.getByRole('heading', { level: 1, name: nome, exact: true })
    }

    precoDoProduto(preco: string): Locator {
        return this.page.getByRole('heading', { level: 2, name: preco, exact: true })
    }

    imagemDoProduto(): Locator {
        return this.page.getByRole('img', { name: 'Product Image', exact: true })
    }

    botaoAdicionarAoCarrinho(): Locator {
        return this.page.getByRole('button', { name: 'Add to Cart' })
    }

    contadorCarrinho(quantidade: number): Locator {
        return this.page.getByRole('link', { name: `My Cart (${quantidade})`, exact: true })
    }

    async acessarFuncionalidadeDeBusca() {
        await this.campoDeBusca.click()
        await expect(this.page).toHaveURL('/search')
    }

    async adicionarProdutoDaHomeAoCarrinhoDeCompras(nomeProduto:string) {
       await this.page.goto(`/collections/frontpage/products/${nomeProduto}`)
       await this.botaoAdicionarAoCarrinho().click()

    }
}
