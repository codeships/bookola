// Fetches the full text of a Project Gutenberg book and paginates it for the
// in-app reader.

const PAGE_CHAR_BUDGET = 1600;

function stripGutenbergBoilerplate(raw: string): string {
  const startMatch = raw.match(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG.*?\*\*\*/i);
  const endMatch = raw.match(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG.*?\*\*\*/i);
  const start = startMatch ? startMatch.index! + startMatch[0].length : 0;
  const end = endMatch ? endMatch.index! : raw.length;
  return raw.slice(start, end).trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|h\d|br)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, '');
}

/** Group paragraphs into pages that fit a rough character budget. */
function paginate(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const pages: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    if (current.length + para.length > PAGE_CHAR_BUDGET && current) {
      pages.push(current.trim());
      current = '';
    }
    current += para + '\n\n';
  }
  if (current.trim()) pages.push(current.trim());
  return pages.length ? pages : ['This book has no readable text.'];
}

export async function fetchBookText(readUrl: string): Promise<string[]> {
  const res = await fetch(readUrl);
  if (!res.ok) throw new Error(`Failed to load book text (${res.status})`);
  let text = await res.text();
  if (/<html|<body|<p[\s>]/i.test(text.slice(0, 2000))) {
    text = stripHtml(text);
  }
  return paginate(stripGutenbergBoilerplate(text));
}
