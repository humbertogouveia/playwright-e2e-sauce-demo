import { Page, Locator } from "@playwright/test"
import { BasePage } from "./basePage"

export class ProdutoPage extends BasePage {
  readonly botaoAdicionarAoCarrinho: Locator = this.page.getByRole("button", {
    name: "Add to Cart",
  })
  // Para produtos esgotados, o mesmo botão passa a se chamar "Sold Out" e fica desabilitado.
  readonly botaoEsgotado: Locator = this.page.getByRole("button", {
    name: "Sold Out",
  })

  constructor(page: Page) {
    super(page)
  }

  nomeDoProduto(nome: string): Locator {
    return this.page.getByRole("heading", { level: 1, name: nome, exact: true })
  }

  precoDoProduto(preco: string): Locator {
    return this.page.getByRole("heading", { level: 2, name: preco, exact: true })
  }

  async adicionarAoCarrinho() {
    await this.botaoAdicionarAoCarrinho.click()
  }
}
