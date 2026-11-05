# Salvar as confirmações no Google Planilhas

As respostas do formulário viram linhas em uma planilha sua. O mesmo script envia o e-mail de
confirmação (com link para cancelar) e, se você quiser, avisa você a cada resposta.
Tudo gratuito, sem banco de dados.

## 1. Criar a planilha e o script (uns 5 minutos)

1. Acesse <https://sheets.new> (logado na conta Google que vai receber as respostas) e dê um nome,
   por exemplo **Confirmações — Festa da Monica**.
2. No menu, abra **Extensões → Apps Script**.
3. Apague o código que já aparece e cole **todo** o conteúdo de [`apps-script/Code.gs`](../apps-script/Code.gs).
4. Na parte `CONFIGURE AQUI`, confira os dados da festa e, se quiser:
   - `NOTIFY_EMAIL`: seu e-mail, para receber um aviso a cada resposta (deixe `''` para não receber);
   - `SITE_URL`: o link do convite, para aparecer no e-mail (pode preencher depois).
5. Clique em **Salvar** (ícone de disquete).

## 2. Autorizar

1. No topo do editor, escolha a função **`configurar`** e clique em **Executar**.
2. Aparecerá um pedido de permissão: **Revisar permissões** → escolha sua conta →
   **Avançado** → **Acessar … (não seguro)** → **Permitir**.
   (O aviso "não seguro" é normal: o script é seu e ainda não foi verificado pelo Google.)
3. Ao terminar, a planilha ganha as abas **Confirmações** e **Resumo** (com o total de pessoas).

## 3. Publicar como aplicativo da web

1. **Implantar → Nova implantação** → engrenagem ao lado de "Selecionar tipo" → **App da Web**.
2. Preencha:
   - **Executar como:** Eu (seu e-mail)
   - **Quem pode acessar:** **Qualquer pessoa**
3. **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

> Sempre que alterar o código do script, use **Implantar → Gerenciar implantações → editar →
> Nova versão**. O URL continua o mesmo.

## 4. Ligar o site ao script

Na pasta do projeto, crie o arquivo `.env.local` (copie de `.env.example`):

```
VITE_RSVP_ENDPOINT=COLE_AQUI_O_URL_QUE_TERMINA_EM_/exec
```

Depois reinicie o `npm run dev`. Quando o site for hospedado, essa mesma variável precisa ser
configurada no serviço de hospedagem **antes** do build (ela não vai para o GitHub, de propósito).

## 5. Testar

1. Abra o convite, confirme a presença com **seu próprio e-mail** e confira:
   - uma linha nova na aba **Confirmações**;
   - o e-mail de confirmação na sua caixa de entrada (olhe o spam na primeira vez);
   - o link **Clique aqui** do e-mail: abre uma página pedindo confirmação; ao confirmar, a linha
     vira **Cancelado**.
2. Apague as linhas de teste da planilha (mantenha o cabeçalho).

## Como funciona

| Situação | O que acontece |
| --- | --- |
| Confirma com e-mail | Grava a linha e envia o e-mail de confirmação com link para cancelar |
| Responde de novo com o mesmo e-mail | Atualiza a linha (não duplica) |
| Marca "Não vou" | Grava como **Não vou**, com 0 pessoas, e não envia e-mail ao convidado |
| Cancela pelo link | Linha vira **Cancelado**; se voltar a confirmar, entra uma linha nova |
| Robô preenche o campo escondido | Resposta ignorada |

## Limites e cuidados

- **E-mails:** contas Gmail comuns enviam até ~100 por dia (Google Workspace, ~1.500). Sobra para uma festa.
- **Privacidade:** a planilha é só sua. Não compartilhe o link da planilha, só o do convite.
- **Endereço público:** o URL do script fica visível no site, então alguém poderia enviar respostas
  falsas. O script valida os dados e ignora robôs simples, mas não é à prova de quem queira abusar.
  Se isso acontecer, é só gerar uma nova implantação (novo URL) e atualizar o `.env.local`.
- **Velocidade:** o Google pode levar 1 a 3 segundos para responder; o formulário mostra "Enviando…".
