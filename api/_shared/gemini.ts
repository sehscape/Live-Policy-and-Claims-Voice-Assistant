/**
 * Shared Gemini API logic used by both the Vercel serverless functions (api/*)
 * and the local Express dev server (server.ts), so the two never drift apart.
 */
import { GoogleGenAI, Type } from '@google/genai';

const TEXT_MODEL = 'gemini-3-flash-preview';
const LIVE_MODEL = 'gemini-3.1-flash-live-preview';

let cachedClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export interface AnalyzePolicyRequest {
  policyId?: string;
  policyName?: string;
  policyText?: string;
  userQuery: string;
  documentContext?: string;
}

export async function analyzePolicyClaim(body: AnalyzePolicyRequest) {
  const { policyName, policyText, userQuery, documentContext } = body;

  if (!userQuery) {
    throw new Error('Caller query or claim description is required');
  }

  const ai = getGenAIClient();

  const systemPrompt = `You are a Senior BFSI Insurance Claims Adjuster & Policy Specialist at NSOffice AI Centre of Excellence.
Your task is to analyze a policyholder's inquiry or claim in plain speech, ground your evaluation strictly in the provided policy document clauses, and speak back a crystal-clear, reassuring explanation instead of a confusing wall of text.

POLICY CONTEXT:
${policyName ? `Policy Name: ${policyName}` : ''}
${policyText ? `Policy Text:\n${policyText.slice(0, 15000)}` : ''}
${documentContext ? `Additional Document Context:\n${documentContext.slice(0, 5000)}` : ''}

INSTRUCTIONS:
1. Determine the Coverage Verdict: COVERED, PARTIALLY_COVERED, EXCLUDED, or DOCUMENTATION_REQUIRED.
2. Identify the EXACT relevant clause and section number (e.g. "Section II - Comprehensive Perils, Clause 1.2(c)").
3. Quote the specific relevant clause text accurately.
4. Calculate or state the exact applicable deductible (e.g., "$250 Comprehensive Deductible rather than $500 Collision").
5. Write a CONCISE Spoken Explanation (2 to 3 natural, conversational sentences) that an adjuster would say out loud to the caller. Avoid acronyms and confusing jargon.
6. Provide a plain-speech breakdown of how the coverage operates.
7. Provide 3-4 concrete caller action steps (e.g. photos to take, receipts to keep, police report if applicable).
8. Formulate a First Notice of Loss (FNOL) summary for the claims file.`;

  const prompt = `Caller's Inquiry / Claim Description:
"${userQuery}"

Provide a structured, clause-grounded insurance adjudication in the requested JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: 'Coverage status: COVERED, PARTIALLY_COVERED, EXCLUDED, or DOCUMENTATION_REQUIRED',
            },
            verdictHeadline: {
              type: Type.STRING,
              description: 'Short headline summary',
            },
            applicableClause: {
              type: Type.STRING,
              description: 'The exact clause citation',
            },
            clauseQuote: {
              type: Type.STRING,
              description: 'Exact verbatim excerpt of the relevant clause',
            },
            deductibleSummary: {
              type: Type.STRING,
              description: 'Exact deductible or copay amount and explanation',
            },
            coverageLimit: {
              type: Type.STRING,
              description: 'Applicable coverage limit or maximum payout specification',
            },
            spokenExplanation: {
              type: Type.STRING,
              description: 'Conversational, spoken explanation (2-3 sentences max) to be read out loud to caller',
            },
            plainSpeechBreakdown: {
              type: Type.STRING,
              description: 'Clear explanation of why this coverage applies in simple terms',
            },
            callerNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 actionable steps the caller must take right now',
            },
            fnolDraft: {
              type: Type.OBJECT,
              properties: {
                claimType: { type: Type.STRING },
                incidentSummary: { type: Type.STRING },
                estimatedDeductible: { type: Type.STRING },
                claimPriority: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
              },
              required: ['claimType', 'incidentSummary', 'estimatedDeductible', 'claimPriority', 'recommendedAction'],
            },
          },
          required: [
            'verdict',
            'verdictHeadline',
            'applicableClause',
            'clauseQuote',
            'deductibleSummary',
            'spokenExplanation',
            'plainSpeechBreakdown',
            'callerNextSteps',
            'fnolDraft',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.verdict) {
      return parsed;
    }
    throw new Error('Model response did not include a verdict');
  } catch (err: any) {
    console.error(`Model ${TEXT_MODEL} adjudication error:`, err.message || err);
    throw err;
  }
}

/**
 * Mints a short-lived ephemeral token so the browser can open a direct
 * WebSocket session to the Gemini Live API without ever seeing GEMINI_API_KEY.
 * Required because Vercel serverless functions cannot host a persistent
 * WebSocket relay themselves.
 */
export async function createLiveEphemeralToken() {
  const ai = getGenAIClient();

  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();

  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      newSessionExpireTime,
      liveConnectConstraints: {
        model: LIVE_MODEL,
      },
    },
  });

  return { token: token.name, expireTime };
}

export const MODELS = {
  TEXT_MODEL,
  LIVE_MODEL,
};
