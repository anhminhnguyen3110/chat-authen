export function calculateSelectionIndexes(
  fullContent: string,
  selectedText: string,
  range: Range
): { start: number; end: number } {
  const startOffset = fullContent.indexOf(selectedText);
  
  if (startOffset === -1) {
    return { start: 0, end: selectedText.length };
  }

  return {
    start: startOffset,
    end: startOffset + selectedText.length,
  };
}
