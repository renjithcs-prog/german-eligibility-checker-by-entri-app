import { UserAnswer } from '../types';

// ============================================================================
// CONFIGURATION: GOOGLE SHEETS WEBHOOK
// ============================================================================
// You can either hardcode the URL here or use the VITE_GOOGLE_SHEETS_WEBHOOK_URL environment variable in Vercel.
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz6G5cEA1UQEG2Gir7W52BcTDcj4qx3u7ifLlxD6gdWVPuEpohrSFyha90usKMKkP5S9A/exec';
// ============================================================================

const getSheetUrl = (): string | undefined => {
  // Check for Vercel/Vite environment variable first
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL) {
    // @ts-ignore
    return import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
  }

  // Fallback to process.env (older build systems)
  if (typeof process !== 'undefined' && process.env && process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  }

  // Fallback to hardcoded URL
  return DEFAULT_WEBHOOK_URL;
};

export const saveLeadToSheet = async (name: string, phone: string, language: string, answers: UserAnswer[]) => {
  const targetUrl = getSheetUrl();

  if (!targetUrl) {
    console.warn("Skipping Sheet save: No Webhook URL configured.");
    return;
  }

  console.log("Attempting to save lead to sheet...");

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