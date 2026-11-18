import { Page, Locator } from "@playwright/test"
import { BasePage } from "./basePage"

export class CatalogoPage extends BasePage {
  readonly tituloCatalogo: Locator = this.page.getByRole("heading", {
    level: 1,
    name: "Products",
    exact: true,
  })
  readonly breadcrumbHome: Locator = this.page
    .getByRole("link", { name: "Home", exact: true })
    .last()
  readonly breadcrumbProducts: Locator = this.page.getByRole("link", {
    name: "Products",
    exact: true,
  })
  // Cada produto da grade é um link que contém o nome em um <h3>.
  // O filtro deixa de fora o h3 do slogan no cabeçalho, que não fica dentro de um link.
  readonly cardsDeProduto: Locator = this.page
    .getByRole("link")
    .filter({ has: this.page.getByRole("heading", { level: 3 }) })

  constructor(page: Page) {
    super(page)
  }

  async acessarPaginaDeCatalogo() {
    await this.page.goto("/collections/all")
  }

  cardDoProduto(nome: string): Locator {
    return this.cardsDeProduto.filter({
      has: this.page.getByRole("heading", { level: 3, name: nome, exact: true }),
    })
  }

  precoNoCard(nome: string): Locator {
    return this.cardDoProduto(nome).getByRole("heading", { level: 4 })
  }

  seloEsgotado(nome: string): Locator {
    return this.cardDoProduto(nome).getByText("Sold Out", { exact: true })
  }

  async acessarProduto(nome: string) {
    await this.cardDoProduto(nome).click()
  }
}
