function normalizeAnswer(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function locallyAccepts(answer: string, correctAnswer: string) {
  const typed = normalizeAnswer(answer);
  const correct = normalizeAnswer(correctAnswer);
  if (!typed || !correct) return false;
  if (typed === correct) return true;

  const aliases: Record<string, string[]> = {
    unitedstates: ['usa', 'us', 'america', 'unitedstatesofamerica'],
    unitedkingdom: ['uk', 'greatbritain', 'britain'],
    uae: ['unitedarabemirates'],
    unitedarabemirates: ['uae'],
    czechrepublic: ['czechia'],
    czechia: ['czechrepublic'],
    southkorea: ['korea', 'republicofkorea'],
    northkorea: ['dprk'],
    russia: ['russianfederation'],
    ivorycoast: ['cotedivoire'],
    cotedivoire: ['ivorycoast'],
  };

  if (aliases[correct]?.includes(typed)) return true;
  if (aliases[typed]?.includes(correct)) return true;

  const distance = levenshtein(typed, correct);
  if (correct.length <= 5) return distance <= 1;
  if (correct.length <= 10) return distance <= 2;
  return distance <= 3;
}

export async function isSmartCorrectAnswer({
  answer,
  correctAnswer,
  questionType,
}: {
  answer: string;
  correctAnswer: string;
  questionType: string;
}) {
  if (locallyAccepts(answer, correctAnswer)) return true;

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL ?? 'https://geogame-nine.vercel.app',
        'X-Title': 'GeoGame smart answer checker',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini',
        temperature: 0,
        max_tokens: 4,
        messages: [
          {
            role: 'system',
            content:
              'You grade geography quiz answers. Accept obvious misspellings, missing accents, local/common names, and abbreviations. Reject answers that mean a different country or city. Reply only YES or NO.',
          },
          {
            role: 'user',
            content: `Question type: ${questionType}\nCorrect answer: ${correctAnswer}\nPlayer answer: ${answer}\nShould this be accepted?`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return false;
    const data = await response.json();
    const content = String(data?.choices?.[0]?.message?.content ?? '').trim().toLowerCase();
    return content.startsWith('yes');
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

