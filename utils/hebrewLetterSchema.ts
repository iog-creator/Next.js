export interface HebrewLetterInfo {
  name: string;
  numericValue: number;
  meaning: string;
}

export const hebrewLetterSchema: { [key: string]: HebrewLetterInfo } = {
  'א': { name: 'Alef', numericValue: 1, meaning: 'Ox, Leader' },
  'ב': { name: 'Bet', numericValue: 2, meaning: 'House, In' },
  'ג': { name: 'Gimel', numericValue: 3, meaning: 'Camel, Pride' },
  'ד': { name: 'Dalet', numericValue: 4, meaning: 'Door, Pathway' },
  'ה': { name: 'He', numericValue: 5, meaning: 'Window, Reveal' },
  'ו': { name: 'Vav', numericValue: 6, meaning: 'Hook, Connect' },
  'ז': { name: 'Zayin', numericValue: 7, meaning: 'Weapon, Cut' },
  'ח': { name: 'Chet', numericValue: 8, meaning: 'Fence, Separate' },
  'ט': { name: 'Tet', numericValue: 9, meaning: 'Snake, Surround' },
  'י': { name: 'Yod', numericValue: 10, meaning: 'Hand, Work' },
  'כ': { name: 'Kaf', numericValue: 20, meaning: 'Palm, Open' },
  'ל': { name: 'Lamed', numericValue: 30, meaning: 'Staff, Teach' },
  'מ': { name: 'Mem', numericValue: 40, meaning: 'Water, Chaos' },
  'נ': { name: 'Nun', numericValue: 50, meaning: 'Fish, Activity' },
  'ס': { name: 'Samekh', numericValue: 60, meaning: 'Support, Trust' },
  'ע': { name: 'Ayin', numericValue: 70, meaning: 'Eye, See' },
  'פ': { name: 'Pe', numericValue: 80, meaning: 'Mouth, Speak' },
  'צ': { name: 'Tsade', numericValue: 90, meaning: 'Fish hook, Catch' },
  'ק': { name: 'Qof', numericValue: 100, meaning: 'Back of head, Last' },
  'ר': { name: 'Resh', numericValue: 200, meaning: 'Head, Highest' },
  'ש': { name: 'Shin', numericValue: 300, meaning: 'Tooth, Sharp' },
  'ת': { name: 'Tav', numericValue: 400, meaning: 'Cross, Sign' }
};