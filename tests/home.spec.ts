import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/homePage'

let homePage: HomePage;

const produto = { nome: 'Grey jacket', preco: '£55.00', slug: 'grey-jacket' }

test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
})

test('Acessar a página de um produto pela Home', async ({ page }) => {
    await test.step('Dado que acesso a página inicial', async () => {
        await homePage.acessarAplicacao()
        await expect(homePage.tituloHome).toBeVisible()
    })

    await test.step(`Quando clico no produto ${produto.nome}`, async () => {
        await homePage.acessarProdutoPeloNome(produto.nome)
    })

    await test.step('Então vejo a página do produto com nome, preço e imagem', async () => {
        // Pela Home, a loja abre /collections/frontpage/products/<slug>
        await expect(page).toHaveURL(new RegExp(`/products/${produto.slug}$`))
        await expect(homePage.nomeDoProduto(produto.nome)).toBeVisible()
        await expect(homePage.precoDoProduto(produto.preco)).toBeVisible()
        await expect(homePage.imagemDoProduto()).toBeVisible()
    })
})

test('Validar busca sem resultados', async ({ page }) => {
    await test.step('Dado que acesso a página inicial', async () => {
        await homePage.acessarAplicacao()
        await expect(homePage.tituloHome).toBeVisible()
    })

    await test.step('Quando acesso a funcionalidade de busca', async () => {
        await homePage.acessarFuncionalidadeDeBusca()
    })
    await test.step('Então vejo mensagem de busca sem resultados', async () => {
        await expect(homePage.mensagemDeBuscaSemResultados).toBeVisible()
    })
})

