# Up Games — loja online

Site e painel da Up Games (R. Alberto Borges Soveral, 69 — Jardim Ranieri, SP).
Next.js 16 + Tailwind 4 + Motion.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Na primeira execução o banco é criado em `data/db.json` com os produtos da loja, cupons e pedidos de demonstração (apagáveis em **Painel → Aparência e loja**).

**Admin:** `adminup@gmail.com` / `admin1234` → entra direto em `/admin`.
Troque a senha em **Minha conta → Dados e endereços** antes de publicar.

## O que tem

**Loja:** home com o "drop" (o item cai num feixe de luz na cor da raridade), catálogo com filtros por categoria/plataforma/condição, página de produto com zoom e galeria, carrinho lateral, checkout (retirada ou entrega, Pix ou pagar na hora, cupom, CEP automático), confirmação com WhatsApp.

**Minha conta:** nível de jogador pelo total gasto, pedidos com linha do tempo, cancelamento enquanto pendente, favoritos, dados, senha e endereços.

**Painel admin:** dashboard (faturamento, pedidos, ticket, lucro, gráfico diário com hover, status, mais vendidos, categorias, estoque baixo) · pedidos com mudança de status e WhatsApp do cliente · produtos com upload de fotos (arrastar e soltar, reordenar), raridade e prévia · estoque com entradas/saídas/ajustes e histórico · categorias · cupons · clientes (promover a admin) · aparência e loja (textos do topo, aviso, drop, troca, contato, horários, entrega, plataformas).

## Dados

Tudo passa por `src/lib/db.ts` (`read` / `mutate`). As imagens enviadas ficam em `data/uploads` e são servidas por `/api/uploads/...`.
Para migrar para Supabase, reimplemente `read`/`mutate` e o upload em `src/app/api/upload/route.ts`.

> Em hospedagem serverless (Vercel) o disco não é persistente: o banco em JSON serve para rodar localmente ou num servidor próprio. Para publicar na Vercel, a migração para Supabase é o próximo passo.

Defina `AUTH_SECRET` (veja `.env.example`) em produção.
