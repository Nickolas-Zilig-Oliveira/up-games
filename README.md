# Up Games — loja online

Site e painel da Up Games (R. Alberto Borges Soveral, 69 — Jardim Ranieri, SP).
Next.js 16 + Tailwind 4 + Motion + **Supabase** (banco, login e fotos).

## Rodar

```bash
npm install
cp .env.example .env.local   # e preencha com a URL e a chave publishable do Supabase
npm run dev
```

**Admin:** `adminup@gmail.com` / `admin1234` → entra direto em `/admin`.
Troque a senha em **Minha conta → Meus dados** antes de divulgar o site.

## Banco de dados (Supabase)

Projeto da conta gamessite360. Tudo que a loja guarda está lá:

| Tabela | O que guarda |
|---|---|
| `profiles` | clientes e admins (o papel `admin` vem daqui) |
| `addresses`, `favorites` | endereços e favoritos de cada cliente |
| `categories`, `products` | catálogo, com fotos no Storage (`products`) |
| `orders`, `order_items` | pedidos e itens |
| `stock_movements` | histórico de estoque (entradas, saídas, vendas, devoluções) |
| `coupons` | cupons de desconto |
| `banners` | banners do topo da home |
| `settings` | textos, contatos, horários e entrega do site |

**Segurança:** o site usa só a chave *publishable*. Quem pode ler ou mudar o quê é decidido pelas
regras de segurança por linha (RLS) do próprio banco: o visitante vê só o catálogo, o cliente vê só os
seus pedidos e o admin vê tudo. Não existe chave de serviço no código.

**Regras de negócio no banco** (funções SQL, atômicas): fazer pedido (calcula preço, frete e cupom e
baixa o estoque de uma vez), cancelar, mudar status (cancelar devolve ao estoque), ajustar estoque e
cadastrar cliente.

## O que tem

**Loja:** banners, drop animado, fileiras que deslizam para o lado, catálogo com filtros, produto com
zoom, carrinho, checkout (retirada ou entrega, Pix ou na hora, cupom, CEP automático), modo claro e escuro.

**Minha conta:** pedidos com linha do tempo, cancelamento enquanto pendente, favoritos, dados, senha e endereços.

**Painel admin:** início com o que precisa de atenção · pedidos · produtos e estoque (− e + na lista, fotos
por upload) · banners · categorias · cupons · clientes (com detalhe e promoção a admin) · textos do site ·
exportar pedidos, produtos e clientes em planilha (CSV).

## Variáveis de ambiente

`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (veja `.env.example`). Na Vercel já estão configuradas.

> Os pedidos de exemplo (marcados `demo`) servem só para o painel não começar vazio. Apague em
> **Textos do site → Pedidos e clientes de exemplo**.
