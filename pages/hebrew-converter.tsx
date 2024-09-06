import { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HebrewLetterInfo, hebrewLetterSchema } from '../utils/hebrewLetterSchema';

interface LetterSoundInfo extends HebrewLetterInfo {
  letter: string;
  frequency: number;
  duration: number;
  amplitude: number;
}

export default function HebrewConverter() {
  const [hebrewText, setHebrewText] = useState("בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ");
  const [soundProperties, setSoundProperties] = useState<LetterSoundInfo[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [amplitude, setAmplitude] = useState(1);
  const [volume, setVolume] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState<LetterSoundInfo | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const generateFrequencyBasedMapping = (text: string) => {
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

  const generateSoundProperties = (text: string, mapping: any) => {
    return text.split('').map(char => {
      if (hebrewLetterSchema[char]) {
        const props = mapping[char];
        return { 
          letter: char,
          ...hebrewLetterSchema[char],
          ...props
        };
      }
      return null;
    }).filter((prop): prop is LetterSoundInfo => prop !== null);
  };

  const analyzePatterns = (soundProps: LetterSoundInfo[]) => {
    const frequencies = soundProps.map(prop => prop.frequency);
    const durations = soundProps.map(prop => prop.duration);
    const amplitudes = soundProps.map(prop => prop.amplitude);

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

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      masterGainRef.current = audioContextRef.current.createGain();

      compressorRef.current.threshold.setValueAtTime(-50, audioContextRef.current.currentTime);
      compressorRef.current.knee.setValueAtTime(40, audioContextRef.current.currentTime);
      compressorRef.current.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressorRef.current.attack.setValueAtTime(0, audioContextRef.current.currentTime);
      compressorRef.current.release.setValueAtTime(0.25, audioContextRef.current.currentTime);

      compressorRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume * 2, audioContextRef.current.currentTime);
    }
  }, [volume]);

  const playSound = (frequency: number, duration: number, letterAmplitude: number) => {
    if (!audioContextRef.current || !compressorRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    const scaledAmplitude = letterAmplitude * amplitude * 2;
    gainNode.gain.setValueAtTime(scaledAmplitude, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / speed);

    oscillator.connect(gainNode);
    gainNode.connect(compressorRef.current);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / speed);
  };

  const playSequence = () => {
    let delay = 0;
    soundProperties.forEach((prop) => {
      setTimeout(() => playSound(prop.frequency, prop.duration, prop.amplitude), delay * 1000);
      delay += prop.duration / speed;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hebrew Text to Sound Converter</h1>
      <textarea
        className="w-full p-2 border rounded text-xl"
        value={hebrewText}
        onChange={(e) => setHebrewText(e.target.value)}
        rows={4}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4 flex items-center space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xl"
          onClick={playSequence}
        >
          Play Entire Sequence
        </button>
        <div>
          <label htmlFor="speed" className="mr-2">Speed:</label>
          <input
            id="speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="ml-2">{speed.toFixed(1)}x</span>
        </div>
        <div>
          <label htmlFor="amplitude" className="mr-2">Amplitude:</label>
          <input
            id="amplitude"
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="ml-2">{amplitude.toFixed(1)}x</span>
        </div>
        <div>
          <label htmlFor="volume" className="mr-2">Volume:</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="ml-2">{(volume * 50).toFixed(0)}%</span>
        </div>
      </div>
      {soundProperties.length > 0 && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">Sound Properties Visualization</h2>
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
          <div className="mt-4 flex flex-wrap">
            {soundProperties.map((prop, index) => (
              <button
                key={index}
                className="m-1 bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-2xl"
                onClick={() => {
                  playSound(prop.frequency, prop.duration, prop.amplitude);
                  setSelectedLetter(prop);
                }}
              >
                {prop.letter}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedLetter && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-xl font-semibold mb-2">Letter Information</h3>
          <p>Letter: {selectedLetter.letter} ({selectedLetter.name})</p>
          <p>Numeric Value: {selectedLetter.numericValue}</p>
          <p>Meaning: {selectedLetter.meaning}</p>
          <p>Frequency: {selectedLetter.frequency.toFixed(2)} Hz</p>
          <p>Duration: {selectedLetter.duration.toFixed(2)} s</p>
          <p>Amplitude: {selectedLetter.amplitude.toFixed(4)}</p>
        </div>
      )}
      {analysis && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">Statistical Analysis</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-lg">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}