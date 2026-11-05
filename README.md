# Convite Virtual

Convite de aniversário online: o anfitrião envia o link e cada convidado confirma a presença
(e quantas pessoas vão) por um formulário.

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS 4 · lucide-react

## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em /dist
npm run lint
```

## Personalizar o convite

Os dados da festa (nome, data, horário, endereço, informações adicionais e dicas de presente) ficam em um único arquivo:
[`src/config/event.ts`](src/config/event.ts). As fotos ficam em `src/assets/`.

As cores da identidade visual ficam em [`src/index.css`](src/index.css) (bloco `@theme`).

## Salvar as confirmações

As respostas vão para uma planilha do Google (e o convidado recebe um e-mail de confirmação com link
para cancelar). Passo a passo em [docs/google-planilhas.md](docs/google-planilhas.md). Sem configurar
nada, o envio do formulário é apenas simulado.

## Estrutura

```
src/
  App.tsx                    tela inicial do convite
  components/
    Countdown.tsx            contagem regressiva até a festa
    Section.tsx              cartão recolhível (local, informações, presentes)
    Modal.tsx                diálogo acessível (Esc, foco, scroll travado)
    RsvpDialog.tsx           formulário de confirmação de presença
  config/event.ts            dados do evento
  services/rsvp.ts           envio da confirmação para o Google Planilhas
apps-script/Code.gs          script do Google que grava na planilha e envia os e-mails
docs/                        guias de configuração
```

## Status

- [x] Tela inicial e formulário de confirmação (validação, máscara de telefone, estado de sucesso)
- [x] Salvar as respostas em planilha e enviar e-mail de confirmação com cancelamento (falta só você instalar o script: veja o guia)
- [ ] Mais personalizações da tela
