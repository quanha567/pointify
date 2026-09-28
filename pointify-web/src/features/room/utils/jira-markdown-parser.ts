/**
 * Heuristic detector for code snippets without explicit language tags.
 * Helps prevent highlight.js from misidentifying JSON as CSS or Perl.
 */
export function detectCodeLanguage(contentLines: string[]): string {
  const nonBlank = contentLines.map((l) => l.trim()).filter(Boolean);
  if (nonBlank.length === 0) return '';

  const first = nonBlank[0];
  const combined = nonBlank.slice(0, 30).join('\n');

  // JSON detection
  if (first.startsWith('{') || first.startsWith('[')) {
    try {
      JSON.parse(combined);
      return 'json';
    } catch {
      if (/"[^"]+"\s*:/.test(combined)) {
        return 'json';
      }
    }
  }

  // Shell / CLI commands
  if (
    /^(?:curl|npm|bun|yarn|pnpm|git|docker|kubectl|cd|export|echo)\b/i.test(first) ||
    first.startsWith('$ ') ||
    first.startsWith('#!/')
  ) {
    return 'bash';
  }

  // SQL queries
  if (/^(?:select|insert|update|delete|create|alter|drop|truncate)\b/i.test(first)) {
    return 'sql';
  }

  // XML / HTML tags
  if (/^<(!DOCTYPE|[a-z0-9_-]+)(?:\s|>)/i.test(first)) {
    return 'xml';
  }

  // TypeScript / JavaScript
  if (/^(?:import|export|const|let|var|function|class|interface|type)\b/.test(first)) {
    return 'typescript';
  }

  return '';
}

/**
 * Preprocesses Jira / ADF / Markdown text before passing to ReactMarkdown:
 * 1. Converts Jira table format (|| header || or missing |---|---| separator) into valid GFM tables.
 * 2. Normalizes single backtick code blocks into triple backticks with accurate language detection.
 * 3. Converts Jira {code:lang} ... {code} into ```lang ... ```.
 * 4. Ensures horizontal rules (---) are surrounded by blank lines so they render as <hr>.
 * 5. Normalizes "Acceptance Criteria• " concatenated headers.
 * 6. Formats "As a ...,I want to ...,so that ..." into cleanly separated lines with bold tags.
 * 7. Formats Gherkin / BDD clauses ("Given ..., When ..., Then ...") into cleanly separated lines with bold tags.
 */
export function preprocessJiraMarkdown(raw: string): string {
  if (!raw) return '';

  let text = raw.trim();

  // 1. Separate "Acceptance Criteria• " into heading + bullet
  text = text.replace(
    /((?:acceptance\s*criteria|tiêu\s*chí\s*chấp\s*nhận|ac\s*\d*)\b[:\s]*)[•\-*]/gi,
    '$1\n\n• ',
  );

  // 2. Separate "As a ...,I want to ...,so that ..." when joined by comma without newline
  text = text.replace(/([,.]\s*)(I want to\b)/gi, '$1\n$2');
  text = text.replace(/([,.]\s*)(so that\b)/gi, '$1\n$2');

  // Bold User story lead-ins if not already bold
  text = text.replace(/^(As a\b)/gim, '**As a**');
  text = text.replace(/^(I want to\b)/gim, '**I want to**');
  text = text.replace(/^(so that\b)/gim, '**so that**');

  // 3. Separate Gherkin / BDD clauses (Given / When / Then / And / But) onto newlines if joined
  text = text.replace(/([^\n\s])\s+(\*{0,2}(?:Given|When|Then|And|But)\b)/gi, '$1\n$2');

  // Normalize Gherkin / BDD lead-ins to clean **Keyword**
  text = text.replace(/^(\s*)\*{0,2}(Given|When|Then|And|But)\b\*{0,2}(?:\s*:)?/gim, '$1**$2**');

  // 4. Jira {code:lang} ... {code} or {noformat} ... {noformat} conversion
  text = text.replace(/\{code(?::([a-z0-9_-]+))?\}([\s\S]*?)\{code\}/gi, (_match, lang, code) => {
    const l = lang ? lang.toLowerCase() : '';
    return `\`\`\`${l}\n${code.trim()}\n\`\`\``;
  });
  text = text.replace(/\{noformat\}([\s\S]*?)\{noformat\}/gi, (_match, code) => {
    return `\`\`\`\n${code.trim()}\n\`\`\``;
  });

  // Process line-by-line for table fixes, blockquote code blocks, and list indentations
  const lines = text.split('\n');
  const processedLines: string[] = [];

  let inTable = false;
  let inCodeBlock = false;
  let underNumberedItem = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track fenced code blocks (```)
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      processedLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      processedLines.push(line);
      continue;
    }

    // Horizontal rule normalization
    if (/^---{1,}$/.test(trimmed)) {
      processedLines.push('');
      processedLines.push('---');
      processedLines.push('');
      continue;
    }

    // Table normalization:
    // Jira || Header 1 || Header 2 || -> | Header 1 | Header 2 |
    if (trimmed.startsWith('||') && trimmed.endsWith('||')) {
      const cleanHeaders = trimmed
        .slice(2, -2)
        .split('||')
        .map((h) => h.trim());
      processedLines.push(`| ${cleanHeaders.join(' | ')} |`);
      processedLines.push(`| ${cleanHeaders.map(() => '---').join(' | ')} |`);
      inTable = true;
      continue;
    }

    // Standard markdown / pipe row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (/^\|[-:\s|]+\|$/.test(trimmed)) {
        processedLines.push(line);
      } else if (!inTable) {
        // First row of table: check if next row is separator
        const nextLine = lines[i + 1]?.trim() || '';
        const nextIsSeparator = nextLine.startsWith('|') && /^\|[-:\s|]+\|$/.test(nextLine);

        processedLines.push(line);
        if (!nextIsSeparator) {
          const colCount = trimmed.slice(1, -1).split('|').length;
          processedLines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);
        }
        inTable = true;
      } else {
        processedLines.push(line);
      }
      continue;
    }

    if (inTable && !trimmed.startsWith('|')) {
      inTable = false;
    }

    // Acceptance criteria heading enhancement
    if (
      /^(?:acceptance\s*criteria|tiêu\s*chí\s*chấp\s*nhận|ac\s*\d+|ac\b|scenario\s*\d+)\b/i.test(
        trimmed,
      ) &&
      !trimmed.startsWith('#')
    ) {
      underNumberedItem = false;
      processedLines.push(`### ${trimmed.replace(/:$/, '')}`);
      continue;
    }

    // Numbered Group Header & List hierarchy
    if (/^\d+\.\s+/.test(trimmed)) {
      underNumberedItem = true;
      const numMatch = trimmed.match(/^(\d+\.\s*)(.*)$/);
      if (numMatch) {
        const prefix = numMatch[1];
        const title = numMatch[2].trim();
        const cleanTitle = title.startsWith('**') ? title : `**${title}**`;
        processedLines.push(`${prefix}${cleanTitle}`);
      } else {
        processedLines.push(trimmed);
      }
      continue;
    }

    if (!trimmed) {
      const nextTrimmed = lines[i + 1]?.trim() || '';
      if (!/^[•◦\-*]/.test(nextTrimmed) && !/^\d+\./.test(nextTrimmed)) {
        underNumberedItem = false;
      }
      processedLines.push('');
      continue;
    }

    // Bullet replacement: proper 3-space / 6-space indentation for nested hierarchy
    if (/^[•◦\-*]\s+/.test(trimmed)) {
      const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length || 0;
      const isSubBullet = leadingSpaces >= 2 || /^[◦]/.test(trimmed);
      const content = trimmed.replace(/^[•◦\-*]\s+/, '');

      if (underNumberedItem) {
        if (isSubBullet) {
          processedLines.push(`      - ${content}`);
        } else {
          processedLines.push(`   - ${content}`);
        }
      } else {
        if (isSubBullet) {
          processedLines.push(`   - ${content}`);
        } else {
          processedLines.push(`- ${content}`);
        }
      }
      continue;
    }

    underNumberedItem = false;
    processedLines.push(line);
  }

  return processedLines.join('\n');
}
