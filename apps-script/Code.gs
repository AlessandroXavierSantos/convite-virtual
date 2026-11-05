/**
 * Convite virtual: recebe as confirmações de presença do site e grava no Google Planilhas.
 * Também envia o e-mail de confirmação (com link para cancelar) e avisa o organizador.
 *
 * Como instalar: veja docs/google-planilhas.md
 */

// ===================== CONFIGURE AQUI =====================
const CONFIG = {
  EVENT_TITLE: 'Festa a fantasia da Monica',
  EVENT_WHEN: 'Sábado, 5 de dezembro de 2026, às 21h00',
  EVENT_WHERE: 'R. Sete, 64 - Cenaculo, Belo Horizonte - MG, 31615-212',
  SENDER_NAME: 'Festa a fantasia da Monica',
  /** Opcional: link do convite (aparece no e-mail). Deixe '' se ainda não tem. */
  SITE_URL: '',
  /** Opcional: seu e-mail para receber um aviso a cada resposta. Deixe '' para não receber. */
  NOTIFY_EMAIL: '',
  /** Máximo de pessoas por confirmação (igual ao do site). */
  MAX_GUESTS: 4,
  TIME_ZONE: 'America/Sao_Paulo',
};
// ==========================================================

const SHEET_NAME = 'Confirmações';
const SUMMARY_SHEET_NAME = 'Resumo';
const HEADERS = ['Data/hora', 'Status', 'Nome', 'Pessoas', 'Acompanhantes', 'E-mail', 'Telefone', 'Recado', 'Token'];
const COL = { TIME: 1, STATUS: 2, NAME: 3, GUESTS: 4, COMPANIONS: 5, EMAIL: 6, PHONE: 7, MESSAGE: 8, TOKEN: 9 };
const STATUS = { YES: 'Vou', NO: 'Não vou', CANCELED: 'Cancelado' };

/** Rode UMA vez no editor: cria as abas e pede as permissões necessárias. */
function configurar() {
  getSheet_();
  getSummarySheet_();
  Logger.log('Pronto! Abas "' + SHEET_NAME + '" e "' + SUMMARY_SHEET_NAME + '" criadas.');
}

// ---------------------------- Entradas web ----------------------------

function doPost(e) {
  try {
    const params = readParams_(e);
    if (params.action === 'cancel') {
      return cancelResultPage_(cancelByToken_(params.token));
    }
    return json_(saveRsvp_(params));
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'internal' });
  }
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'cancel' && params.token) {
    return cancelConfirmPage_(params.token);
  }
  return json_({ ok: true, service: 'convite-virtual' });
}

function readParams_(e) {
  const post = e && e.postData;
  if (post && post.contents && /json|text\/plain/i.test(post.type || '')) {
    return JSON.parse(post.contents);
  }
  return (e && e.parameter) || {};
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------- Confirmação ----------------------------

function saveRsvp_(p) {
  // Campo escondido do formulário: só robôs preenchem. Finge que deu certo e ignora.
  if (p.website) return { ok: true };

  const attending = p.attending === true || p.attending === 'true';
  const name = text_(p.name, 100);
  const email = text_(p.email, 120).toLowerCase();
  const phone = text_(p.phone, 30);
  const message = text_(p.message, 500);
  // Nome de cada acompanhante. O total de pessoas é calculado aqui (convidado + acompanhantes).
  const companions =
    attending && Array.isArray(p.companions) ? p.companions.map((c) => text_(c, 60).replace(/;/g, ',')) : [];
  const guests = attending ? 1 + companions.length : 0;

  if (name.length < 2) return { ok: false, error: 'name' };
  if (companions.length > CONFIG.MAX_GUESTS - 1) return { ok: false, error: 'guests' };
  if (companions.some((c) => c.length < 2)) return { ok: false, error: 'companions' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: 'email' };

  const status = attending ? STATUS.YES : STATUS.NO;
  const companionsText = companions.join('; ');
  const now = Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, 'dd/MM/yyyy HH:mm:ss');
  const sheet = getSheet_();
  let token;

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const values = sheet.getDataRange().getValues();
    // Se a mesma pessoa (mesmo e-mail) responde de novo, atualiza a linha em vez de duplicar.
    let row = -1;
    if (email) {
      for (let i = values.length - 1; i >= 1; i--) {
        if (String(values[i][COL.EMAIL - 1]).toLowerCase() === email && values[i][COL.STATUS - 1] !== STATUS.CANCELED) {
          row = i + 1;
          break;
        }
      }
    }
    if (row > 0) {
      token = String(values[row - 1][COL.TOKEN - 1]);
      sheet
        .getRange(row, 1, 1, COL.MESSAGE)
        .setValues([[now, status, safeCell_(name), guests, safeCell_(companionsText), email, safeCell_(phone), safeCell_(message)]]);
    } else {
      token = Utilities.getUuid();
      sheet.appendRow([now, status, safeCell_(name), guests, safeCell_(companionsText), email, safeCell_(phone), safeCell_(message), token]);
    }
  } finally {
    lock.releaseLock();
  }

  // E-mails: se falharem, a confirmação já está salva na planilha.
  try {
    if (email && attending) sendGuestEmail_(name, companions, email, token);
    if (CONFIG.NOTIFY_EMAIL) sendOwnerEmail_(status, name, companions, phone, message);
  } catch (err) {
    console.error(err);
  }
  return { ok: true };
}

// ---------------------------- Cancelamento ----------------------------

function cancelByToken_(token) {
  token = text_(token, 80);
  if (token.length < 20) return { ok: false };

  const sheet = getSheet_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let result = { ok: false };
  try {
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][COL.TOKEN - 1]) === token) {
        const name = String(values[i][COL.NAME - 1]);
        if (values[i][COL.STATUS - 1] === STATUS.CANCELED) {
          result = { ok: true, name: name, already: true };
        } else {
          sheet.getRange(i + 1, COL.STATUS).setValue(STATUS.CANCELED);
          result = { ok: true, name: name, guests: values[i][COL.GUESTS - 1] };
        }
        break;
      }
    }
  } finally {
    lock.releaseLock();
  }

  if (result.ok && !result.already && CONFIG.NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, 'Presença cancelada: ' + result.name, result.name + ' cancelou a presença.');
    } catch (err) {
      console.error(err);
    }
  }
  return result;
}

// Duas etapas de propósito: abrir o link só mostra uma página; cancelar exige apertar o botão.
// Assim, antivírus e visualizadores de e-mail que "clicam" nos links não cancelam sem querer.
function cancelConfirmPage_(token) {
  const body =
    '<h1>Cancelar presença?</h1>' +
    '<p>Tem certeza de que não poderá ir à ' + esc_(CONFIG.EVENT_TITLE) + '?</p>' +
    '<form method="post" action="' + esc_(ScriptApp.getService().getUrl()) + '" target="_top">' +
    '<input type="hidden" name="action" value="cancel">' +
    '<input type="hidden" name="token" value="' + esc_(token) + '">' +
    '<button type="submit">Sim, cancelar minha presença</button>' +
    '</form>';
  return page_('Cancelar presença', body);
}

function cancelResultPage_(r) {
  if (!r.ok) {
    return page_('Link inválido', '<h1>Link inválido</h1><p>Não encontramos essa confirmação. Fale com o organizador.</p>');
  }
  const msg = r.already ? 'Sua presença já estava cancelada.' : 'Presença cancelada. Sentiremos sua falta!';
  return page_(
    'Presença cancelada',
    '<h1>' + esc_(msg) + '</h1><p>' + esc_(r.name) + ', se mudar de ideia, é só confirmar de novo pelo convite.</p>',
  );
}

function page_(title, body) {
  const html =
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><base target="_top">' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff8f3;' +
    'font-family:system-ui,sans-serif;color:#0f172a;text-align:center;padding:24px}' +
    'main{max-width:420px}h1{font-size:1.4rem}p{color:#64748b;line-height:1.5}' +
    'button{margin-top:12px;background:#8f4f30;color:#fff;border:0;border-radius:14px;' +
    'padding:14px 22px;font-size:1rem;font-weight:600;cursor:pointer}</style></head>' +
    '<body><main>' + body + '</main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(title);
}

// ---------------------------- E-mails ----------------------------

function sendGuestEmail_(name, companions, email, token) {
  const first = name.split(' ')[0];
  const cancelUrl = ScriptApp.getService().getUrl() + '?action=cancel&token=' + encodeURIComponent(token);
  const total = 1 + companions.length;
  const people = total === 1 ? 'só você' : total + ' pessoas';
  const withLine = companions.length ? 'Acompanhante' + (companions.length > 1 ? 's' : '') + ': ' + companions.join(', ') : '';
  const siteLine = CONFIG.SITE_URL ? '\nConvite: ' + CONFIG.SITE_URL : '';

  const plain =
    'Oi, ' + first + '! Sua presença está confirmada (' + people + ').\n' +
    (withLine ? withLine + '\n' : '') + '\n' +
    CONFIG.EVENT_TITLE + '\n' + CONFIG.EVENT_WHEN + '\n' + CONFIG.EVENT_WHERE + siteLine + '\n\n' +
    'Precisa cancelar? Use este link: ' + cancelUrl;

  const html =
    '<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#0f172a">' +
    '<h2 style="color:#8f4f30">Presença confirmada! 🎉</h2>' +
    '<p>Oi, ' + esc_(first) + '! Sua presença está confirmada (<b>' + esc_(people) + '</b>).' +
    (withLine ? '<br>' + esc_(withLine) : '') + '</p>' +
    '<p><b>' + esc_(CONFIG.EVENT_TITLE) + '</b><br>' + esc_(CONFIG.EVENT_WHEN) + '<br>' + esc_(CONFIG.EVENT_WHERE) + '</p>' +
    (CONFIG.SITE_URL ? '<p><a href="' + esc_(CONFIG.SITE_URL) + '">Ver o convite</a></p>' : '') +
    '<p style="color:#64748b;font-size:14px">Precisa cancelar? <a href="' + esc_(cancelUrl) + '">Clique aqui</a>.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: email,
    subject: 'Presença confirmada: ' + CONFIG.EVENT_TITLE,
    body: plain,
    htmlBody: html,
    name: CONFIG.SENDER_NAME,
  });
}

function sendOwnerEmail_(status, name, companions, phone, message) {
  const resumo = status === STATUS.YES ? name + ' vai (' + (1 + companions.length) + ' pessoa(s))' : name + ' não vai';
  MailApp.sendEmail(
    CONFIG.NOTIFY_EMAIL,
    'Nova resposta: ' + resumo,
    resumo +
      (companions.length ? '\nAcompanhantes: ' + companions.join(', ') : '') +
      (phone ? '\nTelefone: ' + phone : '') +
      (message ? '\nRecado: ' + message : ''),
  );
}

// ---------------------------- Planilha ----------------------------

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#fce9df');
    sheet.setColumnWidth(COL.TIME, 140);
    sheet.setColumnWidth(COL.NAME, 200);
    sheet.setColumnWidth(COL.COMPANIONS, 240);
    sheet.setColumnWidth(COL.EMAIL, 200);
    sheet.setColumnWidth(COL.MESSAGE, 320);
  }
  migrateCompanionsColumn_(sheet);
  return sheet;
}

/** Planilhas criadas antes da coluna "Acompanhantes": insere a coluna depois de "Pessoas". */
function migrateCompanionsColumn_(sheet) {
  if (sheet.getRange(1, COL.COMPANIONS).getValue() === HEADERS[COL.COMPANIONS - 1]) return;
  if (sheet.getRange(1, COL.COMPANIONS).getValue() !== 'E-mail') return; // layout desconhecido: não mexe
  sheet.insertColumnAfter(COL.GUESTS);
  sheet.getRange(1, COL.COMPANIONS).setValue(HEADERS[COL.COMPANIONS - 1]).setFontWeight('bold').setBackground('#fce9df');
  sheet.setColumnWidth(COL.COMPANIONS, 240);
}

function getSummarySheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SUMMARY_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SUMMARY_SHEET_NAME);
    const s = "'" + SHEET_NAME + "'";
    sheet.getRange('A1:B5').setFormulas([
      ['Total de pessoas confirmadas', '=SUMIFS(' + s + '!D:D, ' + s + '!B:B, "' + STATUS.YES + '")'],
      ['Respostas "Vou"', '=COUNTIF(' + s + '!B:B, "' + STATUS.YES + '")'],
      ['Respostas "Não vou"', '=COUNTIF(' + s + '!B:B, "' + STATUS.NO + '")'],
      ['Cancelados', '=COUNTIF(' + s + '!B:B, "' + STATUS.CANCELED + '")'],
      ['Total de respostas', '=COUNTA(' + s + '!C:C)-1'],
    ]);
    sheet.getRange('A1:A5').setFontWeight('bold');
    sheet.setColumnWidth(1, 240);
  }
  return sheet;
}

// ---------------------------- Utilidades ----------------------------

function text_(value, max) {
  return String(value === null || value === undefined ? '' : value).trim().slice(0, max);
}

/** Impede que um texto começando com = + - @ seja tratado como fórmula pela planilha. */
function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function esc_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
