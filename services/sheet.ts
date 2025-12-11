import { UserAnswer } from '../types';

// ============================================================================
// CONFIGURATION: GOOGLE SHEETS WEBHOOK
// ============================================================================
// HOW TO SET UP:
// 1. Create a new Google Sheet at https://sheets.new
// 2. Click "Extensions" > "Apps Script"
// 3. Delete any code there and PASTE the "APPS SCRIPT CODE" found at the bottom of this file.
// 4. Click "Deploy" > "New deployment"
// 5. Select type: "Web app"
// 6. Description: "Lead Form" (optional)
// 7. Execute as: "Me"
// 8. Who has access: "Anyone" (IMPORTANT: This allows the app to write to the sheet)
// 9. Click "Deploy", Authorize the app, and COPY the "Web App URL".
// 10. Paste that URL inside the quotes below:

const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz6G5cEA1UQEG2Gir7W52BcTDcj4qx3u7ifLlxD6gdWVPuEpohrSFyha90usKMKkP5S9A/exec';

// ============================================================================


export const saveLeadToSheet = async (name: string, phone: string, language: string, answers: UserAnswer[]) => {
  // Use the hardcoded URL above, or fall back to environment variable
  const targetUrl = SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!targetUrl) {
    console.warn("Skipping Sheet save: No Webhook URL configured in services/sheet.ts");
    return;
  }

  console.log("Attempting to save lead to:", targetUrl);

  try {
    const payload = {
      timestamp: new Date().toISOString(),
      name,
      phone,
      language,
      // Format answers for easier reading in a single cell
      answers: answers.map(a => `${a.questionText}: ${a.selectedOption.label}`).join(' | ')
    };

    // We use 'no-cors' to send data to Google Apps Script without reading the response.
    // Content-Type must be text/plain for no-cors simple requests containing JSON string.
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify(payload),
    });

    console.log("Lead data sent to sheet successfully.");
    
  } catch (error) {
    // We catch errors silently so the user flow isn't interrupted if the sheet save fails
    console.error("Failed to save lead to Google Sheet:", error);
  }
};

/* 
  ============================================================================
  APPS SCRIPT CODE (PASTE THIS INTO GOOGLE APPS SCRIPT)
  ============================================================================
  
  function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 1. Parse the incoming data
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    // 2. Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Date", "Name", "Phone", "Language", "Assessment Details"]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    
    // 3. Append the new row
    sheet.appendRow([new Date(), data.name, data.phone, data.language, data.answers]);
    
    // 4. Return success message
    return ContentService.createTextOutput("Success");
  }

  ============================================================================
*/