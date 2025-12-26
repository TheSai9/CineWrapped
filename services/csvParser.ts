
/**
 * A robust CSV parser that handles quoted strings and different line endings.
 */
export const parseCSV = <T>(csvText: string): T[] => {
  // Normalize line endings to \n
  const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedText.trim().split('\n');
  
  if (lines.length < 2) return [];

  // Helper function to parse a single line respecting quotes
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);
    return values.map(v => v.trim().replace(/^"|"$/g, '').trim());
  };

  // Parse headers using the same logic to handle quoted headers
  const headers = parseLine(lines[0]);
  
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine.trim()) continue;

    const values = parseLine(currentLine);

    if (values.length === headers.length) {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      result.push(obj as T);
    }
  }

  return result;
};
