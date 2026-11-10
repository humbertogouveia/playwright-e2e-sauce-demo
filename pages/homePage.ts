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

    // Locators da página do produto: nome no <h1>, preço no <h2>.
    nomeDoProduto(nome: string): Locator {
        return this.page.getByRole('heading', { level: 1, name: nome, exact: true })
    }

    precoDoProduto(preco: string): Locator {
        return this.page.getByRole('heading', { level: 2, name: preco, exact: true })
    }

    // A foto principal usa o alt genérico "Product Image", e não o nome do produto.
    imagemDoProduto(): Locator {
        return this.page.getByRole('img', { name: 'Product Image', exact: true })
    }

    async acessarFuncionalidadeDeBusca() {
        await this.campoDeBusca.click()
        await expect(this.page).toHaveURL('/search')
    }

}
