/**
 * A deliberately small Markdown subset for blog post bodies.
 *
 * The post page renders content with `dangerouslySetInnerHTML`, so the first thing this does is
 * escape the input. Everything after that operates on already-escaped text, which means a post
 * containing `<script>` renders as the characters `<script>` rather than running. Only the admin
 * can write posts today, so this was never an open hole — but "only trusted people can reach it"
 * is a property of the current configuration, not of the code, and it is the kind of thing that
 * quietly stops being true.
 *
 * The previous renderer handled exactly two things: newlines and `**bold**`. Headings, code and
 * lists came out as literal `#` and backticks, which is most of what a technical post is made
 * of. This adds those and stops there — a real Markdown library is a large dependency for four
 * posts, and this repository just shed thirty-two of those.
 *
 * Supported: fenced code blocks, `#`/`##`/`###` headings, `- ` lists, `**bold**`, `` `code` ``,
 * [links](url), and blank-line-separated paragraphs.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Inline rules, applied to already-escaped text. */
function inline(text: string): string {
  return text
    // Code first: whatever is inside must not then be treated as bold or a link.
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-blue-300">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
    // Only http(s). An unrestricted href would allow `javascript:` — the one link
    // scheme that turns a blog post into script execution.
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
    );
}

function renderBlock(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return '';

  const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
  if (heading) {
    const level = heading[1].length;
    const sizes = ['text-2xl', 'text-xl', 'text-lg'];
    return `<h${level + 1} class="${sizes[level - 1]} font-semibold text-white mt-8 mb-3">${inline(heading[2])}</h${level + 1}>`;
  }

  if (trimmed.split('\n').every((line) => /^[-*]\s+/.test(line.trim()))) {
    const items = trimmed
      .split('\n')
      .map((line) => `<li>${inline(line.trim().replace(/^[-*]\s+/, ''))}</li>`)
      .join('');
    return `<ul class="list-disc list-inside space-y-1 my-4 text-gray-300">${items}</ul>`;
  }

  // A single newline inside a paragraph is a soft wrap in the source, not a
  // line break the reader should see.
  return `<p class="my-4 leading-relaxed text-gray-300">${inline(trimmed.replace(/\n/g, ' '))}</p>`;
}

export function renderMarkdown(source: string): string {
  const escaped = escapeHtml(source);

  // Split on fences so code is never run through the inline rules — a snippet
  // containing `**` or backticks has to survive as written.
  return escaped
    .split(/```/)
    .map((segment, index) => {
      const isCode = index % 2 === 1;
      if (isCode) {
        // Drop an optional language tag on the opening fence.
        const body = segment.replace(/^[a-zA-Z0-9-]*\n/, '');
        return `<pre class="my-5 overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4"><code class="text-sm text-slate-200">${body.replace(/\n$/, '')}</code></pre>`;
      }
      return segment.split(/\n{2,}/).map(renderBlock).join('');
    })
    .join('');
}
