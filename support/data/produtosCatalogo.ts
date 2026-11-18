// Massa de dados do catálogo (/collections/all).
// A loja é pública e pode mudar sem aviso: se um preço ou produto mudar,
// o teste falha aqui com uma mensagem clara, em vez de quebrar um seletor.

export type Produto = {
  nome: string
  preco: string
  slug: string
  esgotado: boolean
}

export const produtosCatalogo: Produto[] = [
  // O slug não corresponde ao nome do produto (herança da loja demo),
  // mas a página de detalhes exibe "Black heels" corretamente.
  { nome: "Black heels", preco: "£45.00", slug: "flower-print-jeans", esgotado: false },
  { nome: "Bronze sandals", preco: "£39.99", slug: "bronze-sandals", esgotado: false },
  { nome: "Brown Shades", preco: "£20.00", slug: "brown-shades", esgotado: true },
  { nome: "Grey jacket", preco: "£55.00", slug: "grey-jacket", esgotado: false },
  { nome: "Noir jacket", preco: "£60.00", slug: "noir-jacket", esgotado: false },
  { nome: "Striped top", preco: "£50.00", slug: "striped-top", esgotado: false },
  { nome: "White sandals", preco: "£25.00", slug: "white-sandals", esgotado: true },
]

export function buscarProduto(nome: string): Produto {
  const produto = produtosCatalogo.find((p) => p.nome === nome)
  if (!produto) throw new Error(`Produto "${nome}" não está na massa de dados do catálogo`)
  return produto
}
