import { analyzePolicyClaim } from '../_shared/gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const result = await analyzePolicyClaim(req.body || {});
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Policy analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze policy claim',
      details: error.message || String(error),
    });
  }
}
