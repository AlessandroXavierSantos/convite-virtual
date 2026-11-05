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

Os dados da festa (nome, idade, data, horário, local, prazo) ficam em um único arquivo:
[`src/config/event.ts`](src/config/event.ts). Os valores atuais são de exemplo.

As cores da identidade visual ficam em [`src/index.css`](src/index.css) (bloco `@theme`).

## Estrutura

```
src/
  App.tsx                    tela inicial do convite
  components/
    Modal.tsx                diálogo acessível (Esc, foco, scroll travado)
    RsvpDialog.tsx           formulário de confirmação de presença
  config/event.ts            dados do evento
  services/rsvp.ts           envio da confirmação
```

## Status

- [x] Tela inicial e formulário de confirmação (validação, máscara de telefone, estado de sucesso)
- [ ] Salvar as respostas (hoje o envio é **simulado** em `src/services/rsvp.ts`)
- [ ] E-mail de confirmação com link de cancelamento
- [ ] Mais personalizações da tela
