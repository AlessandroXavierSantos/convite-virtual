# Publicar o convite no GitHub Pages

O GitHub Pages hospeda o site de graça e gera o link que você envia aos convidados.
Funciona em repositórios **públicos** (no plano gratuito).

O link fica assim: `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`
Neste projeto: **https://alessandroxaviersantos.github.io/convite-virtual/**

## Como funciona

O arquivo [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) faz a publicação
sozinho: a cada atualização enviada para a branch `main`, o GitHub gera o site e o publica
(leva cerca de 1 a 2 minutos). Você não precisa rodar nada no computador.

## Configurar do zero (uma vez só)

Já está feito neste repositório. Para repetir em outro (por exemplo, num fork):

1. **Repositório público.** Settings → Danger Zone → Change visibility → Public.
2. **Ligar o Pages.** Settings → **Pages** → em **Source**, escolha **GitHub Actions**.
3. **Endereço do script do Google (para as confirmações serem gravadas).**
   Settings → **Secrets and variables → Actions → aba Variables → New repository variable**
   - Name: `VITE_RSVP_ENDPOINT`
   - Value: o endereço do seu script do Google, o que termina em `/exec`
     (veja [google-planilhas.md](google-planilhas.md)).
   
   Sem essa variável o site publica normalmente, mas o formulário só **simula** o envio.
4. **Primeira publicação.** Aba **Actions** → **Publicar convite (GitHub Pages)** → **Run workflow**
   (ou faça qualquer commit na `main`).
5. Quando o ícone ficar verde, abra o link. Ele também aparece em Settings → Pages.

## Enviar o link aos convidados

Copie o endereço do site (não o do repositório no GitHub) e mande por WhatsApp, e-mail etc.

- Teste o link no celular, em uma aba anônima, antes de divulgar.
- Toque no lacre do envelope, confirme uma presença de teste e veja se chega na planilha.
  Depois apague a linha de teste da planilha.

## Colocar o link no e-mail de confirmação

Para o e-mail que o convidado recebe ter o link do convite:

1. Planilha → **Extensões → Apps Script**.
2. Em `SITE_URL: ''`, coloque o link do site entre aspas.
3. Salve e publique uma **Nova versão** (Implantar → Gerenciar implantações → lápis → Nova versão).

## Atualizar o convite depois de publicado

Mudou um texto, a foto ou a data? Edite, faça o commit e envie (`git push`) para a `main`.
O site se atualiza sozinho em 1 a 2 minutos. O link continua o mesmo.
(Quem já abriu o convite pode precisar recarregar a página.)

## Problemas comuns

| Sintoma | O que fazer |
| --- | --- |
| Link dá erro 404 logo após configurar | Espere 1 a 2 minutos e veja a aba **Actions**: a publicação precisa estar verde. |
| A publicação (Actions) ficou vermelha | Clique nela para ver o erro. Se for permissão, confira **Settings → Pages → Source: GitHub Actions**. |
| O site abre, mas o formulário diz "Presença confirmada" e nada chega na planilha | A variável `VITE_RSVP_ENDPOINT` não foi criada ou está errada. Corrija e rode **Run workflow** de novo. |
| Página em branco | O site precisa estar na subpasta do repositório. Use sempre o link completo, com `/NOME_DO_REPOSITORIO/` no final. |

## Mudar o nome do link depois

O nome do link vem do nome do repositório. Para ter `.../aniversariomonica/`, renomeie o
repositório em Settings → General → Repository name. A publicação seguinte já usa o nome novo.
(Links antigos deixam de funcionar, então renomeie **antes** de divulgar.)
