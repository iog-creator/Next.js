import { hebrewLetterSchema } from './hebrewLetterSchema';

export const generateFrequencyBasedMapping = (text: string) => {
  const letterCounts: {[key: string]: number} = {};
  text.split('').forEach(char => {
    if (hebrewLetterSchema[char]) {
      letterCounts[char] = (letterCounts[char] || 0) + 1;
    }
  });

  const totalLetters = Object.values(letterCounts).reduce((a, b) => a + b, 0);
  const frequencyPercentages = Object.fromEntries(
    Object.entries(letterCounts).map(([letter, count]) => [letter, count / totalLetters])
  );

  const sortedLetters = Object.keys(frequencyPercentages).sort(
    (a, b) => frequencyPercentages[b] - frequencyPercentages[a]
  );

  const baseFrequency = 20; // Hz
  const frequencyStep = 10; // Hz
  return Object.fromEntries(
    sortedLetters.map((letter, i) => [
      letter,
      {
        frequency: baseFrequency + i * frequencyStep,
        duration: 0.1 * (hebrewLetterSchema[letter].numericValue / 10),
        amplitude: 0.1 * (1 - frequencyPercentages[letter])
      }
    ])
  );
};

export const generateSoundProperties = (text: string, mapping: any) => {
  return text.split('').map(char => {
    if (hebrewLetterSchema[char]) {
      const props = mapping[char];
      return { 
        letter: char, 
        ...props, 
        ...hebrewLetterSchema[char] 
      };
    }
    return null;
  }).filter(prop => prop !== null);
};

export const analyzePatterns = (soundProperties: any[]) => {
  const frequencies = soundProperties.map(prop => prop.frequency);
  const durations = soundProperties.map(prop => prop.duration);
  const amplitudes = soundProperties.map(prop => prop.amplitude);

  const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    frequency: {
      average: average(frequencies),
      median: median(frequencies),
      min: Math.min(...frequencies),
      max: Math.max(...frequencies)
    },
    duration: {
      total: durations.reduce((a, b) => a + b, 0),
      average: average(durations),
      median: median(durations)
    },
    amplitude: {
      average: average(amplitudes),
      median: median(amplitudes),
      min: Math.min(...amplitudes),
      max: Math.max(...amplitudes)
    }
  };
};