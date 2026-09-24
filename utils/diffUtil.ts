/**
 * Enterprise Document Diff Utility for Policy Generator
 * Computes block, line, and word-level differences between policy versions.
 */

export interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface BlockDiff {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  oldText?: string;
  newText?: string;
  wordDiffs?: DiffPart[];
}

export interface DiffResult {
  blocks: BlockDiff[];
  additions: number;
  deletions: number;
  unchanged: number;
  similarity: number;
}

/**
 * Strips HTML tags into clean, human-readable structured lines
 */
export const htmlToStructuredLines = (html: string): string[] => {
  if (!html) return [];

  // Replace block tags with newline breaks
  const formatted = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n### $1\n')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<td[^>]*>(.*?)<\/td>/gi, ' | $1 ')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n• $1')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  const decoded = formatted
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Split by line and trim empty lines
  return decoded
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);
};

/**
 * Word-level diff using simple LCS approach
 */
export const computeWordDiff = (oldText: string, newText: string): DiffPart[] => {
  const oldWords = oldText.split(/(\s+)/).filter(Boolean);
  const newWords = newText.split(/(\s+)/).filter(Boolean);

  const m = oldWords.length;
  const n = newWords.length;

  // If one string is empty
  if (m === 0 && n === 0) return [];
  if (m === 0) return [{ type: 'added', text: newText }];
  if (n === 0) return [{ type: 'removed', text: oldText }];

  // LCS Matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  let i = m;
  let j = n;
  const result: DiffPart[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: 'unchanged', text: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'removed', text: oldWords[i - 1] });
      i--;
    }
  }

  // Group adjacent diff tokens
  const grouped: DiffPart[] = [];
  for (const item of result) {
    const last = grouped[grouped.length - 1];
    if (last && last.type === item.type) {
      last.text += item.text;
    } else {
      grouped.push({ ...item });
    }
  }

  return grouped;
};

/**
 * Computes full block-level diff between two policy HTML strings
 */
export const computePolicyDiff = (oldHtml: string, newHtml: string): DiffResult => {
  const oldLines = htmlToStructuredLines(oldHtml);
  const newLines = htmlToStructuredLines(newHtml);

  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const rawDiffs: { type: 'added' | 'removed' | 'unchanged'; text: string }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawDiffs.unshift({ type: 'unchanged', text: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiffs.unshift({ type: 'added', text: newLines[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiffs.unshift({ type: 'removed', text: oldLines[i - 1] });
      i--;
    }
  }

  // Combine adjacent removed and added lines into 'modified' blocks with word diff
  const blocks: BlockDiff[] = [];
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  for (let k = 0; k < rawDiffs.length; k++) {
    const curr = rawDiffs[k];
    const next = rawDiffs[k + 1];

    if (curr.type === 'removed' && next && next.type === 'added') {
      // Modified paragraph
      const wordDiffs = computeWordDiff(curr.text, next.text);
      blocks.push({
        type: 'modified',
        oldText: curr.text,
        newText: next.text,
        wordDiffs
      });
      deletions++;
      additions++;
      k++; // Skip next
    } else if (curr.type === 'added') {
      blocks.push({ type: 'added', newText: curr.text });
      additions++;
    } else if (curr.type === 'removed') {
      blocks.push({ type: 'removed', oldText: curr.text });
      deletions++;
    } else {
      blocks.push({ type: 'unchanged', newText: curr.text, oldText: curr.text });
      unchanged++;
    }
  }

  const total = additions + deletions + unchanged;
  const similarity = total === 0 ? 100 : Math.round((unchanged / total) * 100);

  return {
    blocks,
    additions,
    deletions,
    unchanged,
    similarity
  };
};
