import { test, expect } from "@playwright/test"
import { CatalogoPage } from "../pages/catalogoPage"
import { ProdutoPage } from "../pages/produtoPage"
import { CarrinhoPage } from "../pages/carrinhoPage"
import { produtosCatalogo, buscarProduto } from "../support/data/produtosCatalogo"

let catalogoPage: CatalogoPage
let produtoPage: ProdutoPage
let carrinhoPage: CarrinhoPage

test.beforeEach(async ({ page }) => {
  catalogoPage = new CatalogoPage(page)
  produtoPage = new ProdutoPage(page)
  carrinhoPage = new CarrinhoPage(page)
  await catalogoPage.acessarPaginaDeCatalogo()
})

test.describe("Página de coleção de produtos (Catalog)", () => {
  test("Exibir a página de coleção corretamente", { tag: ["@smoke", "@colecao"] }, async ({ page }) => {
    await test.step('Então o título da página deve ser "Products – Sauce Demo"', async () => {
      await expect(page).toHaveTitle("Products – Sauce Demo")
    })

    await test.step('E o cabeçalho principal e o breadcrumb exibem "Products"', async () => {
      await expect(catalogoPage.tituloCatalogo).toBeVisible()
      await expect(catalogoPage.breadcrumbHome).toBeVisible()
      await expect(catalogoPage.breadcrumbProducts).toBeVisible()
    })

    await test.step(`E devem ser exibidos ${produtosCatalogo.length} produtos na grade`, async () => {
      await expect(catalogoPage.cardsDeProduto).toHaveCount(produtosCatalogo.length)
    })
  })

  for (const produto of produtosCatalogo) {
    test(`Exibir nome e preço do produto ${produto.nome}`, { tag: ["@smoke", "@colecao"] }, async () => {
      await test.step(`Então devo ver o produto "${produto.nome}" com o preço "${produto.preco}"`, async () => {
        await expect(catalogoPage.cardDoProduto(produto.nome)).toBeVisible()
        await expect(catalogoPage.precoNoCard(produto.nome)).toHaveText(produto.preco)
      })
    })
  }

  for (const produto of produtosCatalogo) {
    const condicao = produto.esgotado ? "deve" : "não deve"

    test(`Indicar a disponibilidade do produto ${produto.nome}`, { tag: ["@regra-negocio", "@estoque"] }, async () => {
      await test.step(`Então o produto "${produto.nome}" ${condicao} exibir o selo "Sold Out"`, async () => {
        if (produto.esgotado) {
          await expect(catalogoPage.seloEsgotado(produto.nome)).toBeVisible()
        } else {
          await expect(catalogoPage.cardDoProduto(produto.nome)).toBeVisible()
          await expect(catalogoPage.seloEsgotado(produto.nome)).toHaveCount(0)
        }
      })
    })
  }

  for (const nome of ["Grey jacket", "Noir jacket", "Black heels"]) {
    const produto = buscarProduto(nome)

    test(`Abrir a página de detalhes do produto ${produto.nome} a partir da coleção`, { tag: "@navegacao" }, async ({ page }) => {
      await test.step(`Quando clico no produto "${produto.nome}"`, async () => {
        await catalogoPage.acessarProduto(produto.nome)
      })

      await test.step(`Então devo ser direcionado para a página de detalhes de "${produto.nome}"`, async () => {
        await expect(page).toHaveURL(new RegExp(`/products/${produto.slug}$`))
        // O título é validado além da URL: o slug do Black heels (flower-print-jeans)
        // não indica o produto, então só a URL não garante que o PDP certo abriu.
        await expect(page).toHaveTitle(`${produto.nome} – Sauce Demo`)
      })

      await test.step(`E o PDP exibe o nome "${produto.nome}" e o preço "${produto.preco}"`, async () => {
        await expect(produtoPage.nomeDoProduto(produto.nome)).toBeVisible()
        await expect(produtoPage.precoDoProduto(produto.preco)).toBeVisible()
      })
    })
  }

  test("Adicionar ao carrinho um produto disponível", { tag: ["@e2e", "@carrinho"] }, async () => {
    const produto = buscarProduto("Grey jacket")

    await test.step('Dado que o carrinho exibe "My Cart (0)"', async () => {
      await expect(carrinhoPage.contadorCarrinho(0)).toBeVisible()
    })

    await test.step(`Quando clico no produto "${produto.nome}"`, async () => {
      await catalogoPage.acessarProduto(produto.nome)
      await expect(produtoPage.nomeDoProduto(produto.nome)).toBeVisible()
    })

    await test.step("E adiciono o produto ao carrinho", async () => {
      await produtoPage.adicionarAoCarrinho()
    })

    await test.step('Então o carrinho deve exibir "My Cart (1)"', async () => {
      await expect(carrinhoPage.contadorCarrinho(1)).toBeVisible()
    })

    await test.step(`E o carrinho deve conter "${produto.nome}" com o total "${produto.preco}"`, async () => {
      await carrinhoPage.acessarCarrinho()
      await expect(carrinhoPage.tituloCarrinho).toBeVisible()
      await expect(carrinhoPage.itemDoCarrinho(produto.nome)).toBeVisible()
      await expect(carrinhoPage.totalDoCarrinho(produto.preco)).toBeVisible()
    })
  })

  test("Impedir a compra de um produto esgotado", { tag: ["@negativo", "@estoque"] }, async () => {
    const produto = buscarProduto("Brown Shades")

    await test.step(`Quando clico no produto "${produto.nome}"`, async () => {
      await catalogoPage.acessarProduto(produto.nome)
      await expect(produtoPage.nomeDoProduto(produto.nome)).toBeVisible()
    })

    await test.step('Então o botão de compra exibe "Sold Out" e fica desabilitado', async () => {
      await expect(produtoPage.botaoEsgotado).toBeVisible()
      await expect(produtoPage.botaoEsgotado).toBeDisabled()
      await expect(produtoPage.botaoAdicionarAoCarrinho).toHaveCount(0)
    })

    await test.step('E o carrinho deve continuar exibindo "My Cart (0)"', async () => {
      await expect(carrinhoPage.contadorCarrinho(0)).toBeVisible()
    })
  })
})
