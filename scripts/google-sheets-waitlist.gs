/**
 * Oppra waitlist receiver. Paste into Extensions > Apps Script in your Sheet.
 * Set SPREADSHEET_ID and WEBHOOK_SECRET in Project Settings > Script properties.
 * Deploy as a Web app: execute as yourself; access: Anyone.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "Oppra waitlist webhook is ready. Submit entries with POST.",
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  const json = (value) => ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
  const properties = PropertiesService.getScriptProperties();
  const secret = properties.getProperty("WEBHOOK_SECRET");
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  let lock;

  try {
    if (!secret || !spreadsheetId || !event || !event.postData || event.postData.contents.length > 8192) {
      return json({ success: false });
    }
    const data = JSON.parse(event.postData.contents);
    if (!data || data.secret !== secret) return json({ success: false });

    const limits = { fullName: 100, email: 254, phone: 30, industry: 100, useCase: 1000 };
    const industries = [
      "Solar & field install", "Logistics & delivery", "Cleaning & facilities",
      "AC & appliance repair", "Marketing & creative", "Generator servicing",
      "Fumigation & pest control", "Security & guards", "Other",
    ];
    for (const field of Object.keys(limits)) {
      if (typeof data[field] !== "string" || data[field].length > limits[field]) {
        return json({ success: false });
      }
      data[field] = data[field].trim();
    }
    data.email = data.email.toLowerCase();
    if (data.fullName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !industries.includes(data.industry)) {
      return json({ success: false });
    }
    if (data.phone && (!/^\+?[0-9\s().-]+$/.test(data.phone) || data.phone.replace(/\D/g, "").length < 7 || data.phone.replace(/\D/g, "").length > 15)) {
      return json({ success: false });
    }

    // Serialize duplicate checks and inserts so retries don't create extra rows.
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return json({ success: false });

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName("Waitlist") || spreadsheet.insertSheet("Waitlist");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Joined at (UTC)", "Full Name", "Email Address", "Phone Number", "Industry", "What do you want to use Oppra for?"]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#eaf0ff");
    }

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existing = sheet.getRange(2, 3, lastRow - 1, 1)
        .createTextFinder(data.email)
        .matchEntireCell(true)
        .matchCase(false)
        .useRegularExpression(false)
        .findNext();
      if (existing) return json({ success: true });
    }

    // Prefix formula-like values to keep submitted content as plain text.
    const safeCell = (value) => /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
    sheet.appendRow([
      new Date().toISOString(),
      safeCell(data.fullName),
      safeCell(data.email),
      safeCell(data.phone),
      safeCell(data.industry),
      safeCell(data.useCase),
    ]);
    SpreadsheetApp.flush();
    return json({ success: true });
  } catch {
    // Return no personal details, secrets, or internal Google errors.
    return json({ success: false });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
