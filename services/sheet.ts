import { UserAnswer } from '../types';

// Declare process for TypeScript to avoid build errors
declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};

// ============================================================================
// CONFIGURATION: GOOGLE SHEETS WEBHOOK
// ============================================================================
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz6G5cEA1UQEG2Gir7W52BcTDcj4qx3u7ifLlxD6gdWVPuEpohrSFyha90usKMKkP5S9A/exec';
// ============================================================================

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export const saveLeadToSheet = async (
  name: string, 
  phone: string, 
  language: string, 
  answers: UserAnswer[],
  utmParams: UtmParams = {}
) => {
  // Priority: VITE_ environment var, then process.env, then default
  // @ts-ignore
  const targetUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL) || 
                    process.env.GOOGLE_SHEETS_WEBHOOK_URL || 
                    DEFAULT_WEBHOOK_URL;

  if (!targetUrl) {
    console.warn("Skipping Sheet save: No Webhook URL configured.");
    return;
  }

  try {
    const payload = {
      timestamp: new Date().toISOString(),
      name,
      phone,
      language,
      // UTM Tracking Data
      utm_source: utmParams.utm_source || '',
      utm_medium: utmParams.utm_medium || '',
      utm_campaign: utmParams.utm_campaign || '',
      utm_term: utmParams.utm_term || '',
      utm_content: utmParams.utm_content || '',
      // User Answers
      answers: answers.map(a => `${a.questionText}: ${a.selectedOption.label}`).join(' | ')
    };

    // Use fetch with text/plain to avoid CORS preflight issues with Google Apps Script
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify(payload),
    });

    console.log("Lead data with UTMs sent to sheet successfully.");
    
  } catch (error) {
    console.error("Failed to save lead to Google Sheet:", error);
  }
};