const SPREADSHEET_ID = "";
const SHEET_NAME = "Confirmacoes";

function doGet() {
  return jsonResponse_({
    status: "online",
    service: "wedding-rsvp",
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const payload = parsePayload_(e);
    const sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.attendance || "",
      Number(payload.guests || 0),
      payload.message || "",
      payload.source || "",
      payload.userAgent || "",
    ]);

    return jsonResponse_({
      status: "ok",
    });
  } catch (error) {
    return jsonResponse_({
      status: "error",
      message: error.message,
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      // The lock may not have been acquired if Apps Script failed early.
    }
  }
}

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Data",
      "Nome",
      "Resposta",
      "Acompanhantes",
      "Mensagem",
      "Origem",
      "Navegador",
    ]);
  }

  return sheet;
}

function parsePayload_(e) {
  const contents = e && e.postData && e.postData.contents ? e.postData.contents : "";

  if (contents) {
    try {
      return JSON.parse(contents);
    } catch (error) {
      return e.parameter || {};
    }
  }

  return e && e.parameter ? e.parameter : {};
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
