import { Page, Locator } from "@playwright/test"
import { BasePage } from "./basePage"

export class CarrinhoPage extends BasePage {
  readonly tituloCarrinho: Locator = this.page.getByRole("heading", {
    level: 1,
    name: "My Cart",
    exact: true,
  })

  constructor(page: Page) {
    super(page)
  }

  async acessarCarrinho() {
    await this.page.goto("/cart")
  }

  // Contador do cabeçalho, presente em todas as páginas da loja.
  contadorCarrinho(quantidade: number): Locator {
    return this.page.getByRole("link", { name: `My Cart (${quantidade})`, exact: true })
  }

  // No carrinho, a linha do item é exibida como "<produto> - <variante>".
  itemDoCarrinho(nome: string): Locator {
    return this.page.getByRole("heading", { level: 3, name: new RegExp(`^${nome} - `) })
  }

  totalDoCarrinho(valor: string): Locator {
    return this.page.getByRole("heading", { level: 2, name: `Total ${valor}`, exact: true })
  }
}
