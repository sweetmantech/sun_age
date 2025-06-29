// Solar identity and sun sign logic for Solara

// Sun sign date ranges
const sunSignRanges = [
  { sign: 'Aquarius', start: '01-20', end: '02-18' },
  { sign: 'Pisces', start: '02-19', end: '03-20' },
  { sign: 'Aries', start: '03-21', end: '04-19' },
  { sign: 'Taurus', start: '04-20', end: '05-20' },
  { sign: 'Gemini', start: '05-21', end: '06-20' },
  { sign: 'Cancer', start: '06-21', end: '07-22' },
  { sign: 'Leo', start: '07-23', end: '08-22' },
  { sign: 'Virgo', start: '08-23', end: '09-22' },
  { sign: 'Libra', start: '09-23', end: '10-22' },
  { sign: 'Scorpio', start: '10-23', end: '11-21' },
  { sign: 'Sagittarius', start: '11-22', end: '12-21' },
  { sign: 'Capricorn', start: '12-22', end: '01-19' },
];

export function getSunSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  for (const { sign, start, end } of sunSignRanges) {
    if (start < end) {
      if (mmdd >= start && mmdd <= end) return sign;
    } else {
      // Capricorn wraps year end
      if (mmdd >= start || mmdd <= end) return sign;
    }
  }
  return 'Unknown';
}

export const sunSignToArchetype: Record<string, string> = {
  'Aries': 'Solar Innovator',
  'Leo': 'Solar Artist',
  'Sagittarius': 'Solar Sage',
  'Taurus': 'Solar Nurturer',
  'Virgo': 'Solar Builder',
  'Capricorn': 'Solar Builder',
  'Gemini': 'Solar Innovator',
  'Libra': 'Solar Artist',
  'Aquarius': 'Solar Innovator',
  'Cancer': 'Solar Nurturer',
  'Scorpio': 'Solar Alchemist',
  'Pisces': 'Solar Alchemist',
};

export function getSolarArchetype(birthDate: string): string {
  const sunSign = getSunSign(birthDate);
  return sunSignToArchetype[sunSign] || 'Solar Traveler';
}

export const solarArchetypeCoreQuotes: Record<string, string> = {
  'Solar Innovator': "I channel tomorrow's dreams into today's reality",
  'Solar Nurturer': "I create sacred spaces where souls can grow",
  'Solar Alchemist': "I transform darkness into golden wisdom",
  'Solar Sage': "I expand consciousness through adventurous wisdom-seeking",
  'Solar Builder': "I construct lasting foundations that support collective achievement",
  'Solar Artist': "I weave beauty and harmony into the fabric of human connection",
  'Solar Traveler': "You are a child of the cosmos, a way for the universe to know itself.",
};

export const solarArchetypeRadiatesWith: Record<string, string> = {
  'Solar Innovator': 'Their inner Sol radiates with electric creativity and humanitarian vision.',
  'Solar Nurturer': 'Their inner Sol radiates with nurturing care and the power to help others grow.',
  'Solar Alchemist': 'Their inner Sol radiates with transformative wisdom and the courage to turn darkness into light.',
  'Solar Sage': 'Their inner Sol radiates with adventurous wisdom and a quest to expand consciousness.',
  'Solar Builder': 'Their inner Sol radiates with steadfast dedication and the ability to create lasting foundations.',
  'Solar Artist': 'Their inner Sol radiates with beauty, harmony, and the gift of inspiring human connection.',
  'Solar Traveler': 'Their inner Sol radiates with curiosity and cosmic wonder.'
}; 