import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateFrequencyBasedMapping = (text: string) => {
  const letterCounts: {[key: string]: number} = {};
  text.split('').forEach(char => {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
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
        duration: 0.1 * (i + 1),
        amplitude: 0.1 * (1 - frequencyPercentages[letter])
      }
    ])
  );
};

const generateSoundProperties = (text: string, mapping: any) => {
  return text.split('').map(char => {
    const props = mapping[char] || { frequency: 0, duration: 0, amplitude: 0 };
    return { letter: char, ...props };
  }).filter(prop => prop.frequency !== 0);
};

const analyzePatterns = (soundProperties: any[]) => {
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

export default function HebrewConverter() {
  const [hebrewText, setHebrewText] = useState("בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ");
  const [soundProperties, setSoundProperties] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const mapping = useMemo(() => generateFrequencyBasedMapping(hebrewText), [hebrewText]);

  useEffect(() => {
    try {
      const properties = generateSoundProperties(hebrewText, mapping);
      setSoundProperties(properties);
      setAnalysis(analyzePatterns(properties));
      setError(null);
    } catch (err) {
      console.error("Error processing Hebrew text:", err);
      setError("An error occurred while processing the text. Please try again.");
    }
  }, [hebrewText, mapping]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hebrew Text to Sound Converter</h1>
      <textarea
        className="w-full p-2 border rounded"
        value={hebrewText}
        onChange={(e) => setHebrewText(e.target.value)}
        rows={4}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {soundProperties.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Sound Properties Visualization</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={soundProperties}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="letter" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="frequency" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="amplitude" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {analysis && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Statistical Analysis</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}