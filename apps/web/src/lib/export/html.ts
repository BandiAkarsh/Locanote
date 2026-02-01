// ============================================================================
// HTML EXPORT
// ============================================================================
// Converts TipTap JSON content to HTML format with styling.
//
// USAGE:
// import { exportToHTML, downloadHTML } from '$lib/export/html';
// const html = exportToHTML(editor.getJSON());
// downloadHTML(html, 'my-note.html');
// ============================================================================

// Type declarations
declare const document: any;
declare const Blob: new (parts: string[], options?: { type?: string }) => any;
declare const URL: { createObjectURL(blob: any): string; revokeObjectURL(url: string): void };

interface TextNode {
  type: 'text';
  text: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface ContentNode {
  type: string;
  content?: Array<ContentNode | TextNode>;
  attrs?: Record<string, any>;
  text?: string;
}

interface TipTapDoc {
  type: 'doc';
  content: ContentNode[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================
function isTextNode(node: ContentNode | TextNode): node is TextNode {
  return node.type === 'text' && 'text' in node;
}

function isContentNode(node: ContentNode | TextNode): node is ContentNode {
  return node.type !== 'text';
}

// ============================================================================
// CONVERT TEXT NODE TO HTML
// ============================================================================
function textNodeToHTML(node: TextNode): string {
  let text = escapeHTML(node.text);
  
  if (node.marks) {
    // Apply marks in order
    for (const mark of node.marks) {
      switch (mark.type) {
        case 'bold':
        case 'strong':
          text = `<strong>${text}</strong>`;
          break;
        case 'italic':
        case 'em':
          text = `<em>${text}</em>`;
          break;
        case 'strike':
        case 's':
          text = `<s>${text}</s>`;
          break;
        case 'code':
          text = `<code>${text}</code>`;
          break;
        case 'link':
          const href = escapeHTML(mark.attrs?.href || '#');
          text = `<a href="${href}">${text}</a>`;
          break;
        case 'highlight':
          text = `<mark>${text}</mark>`;
          break;
      }
    }
  }
  
  return text;
}

// ============================================================================
// ESCAPE HTML SPECIAL CHARACTERS
// ============================================================================
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// CONVERT NODE TO HTML
// ============================================================================
function nodeToHTML(node: ContentNode | TextNode): string {
  // Handle text nodes
  if (isTextNode(node)) {
    return textNodeToHTML(node);
  }
  
  // At this point, node is ContentNode (not TextNode)
  const contentNode = node as ContentNode;
  const content = contentNode.content || [];
  const children = content.map((child: ContentNode | TextNode) => 
    nodeToHTML(child)
  ).join('');
  
  switch (contentNode.type) {
    case 'paragraph':
      return `<p>${children}</p>`;
      
    case 'heading':
      const level = contentNode.attrs?.level || 1;
      return `<h${level}>${children}</h${level}>`;
      
    case 'bulletList':
      return `<ul>${children}</ul>`;
      
    case 'orderedList':
      return `<ol>${children}</ol>`;
      
    case 'listItem':
      return `<li>${children}</li>`;
      
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
      
    case 'codeBlock':
      const language = contentNode.attrs?.language || '';
      return `<pre><code class="language-${language}">${escapeHTML(children)}</code></pre>`;
      
    case 'horizontalRule':
      return `<hr />`;
      
    case 'hardBreak':
      return '<br />';
      
    case 'taskList':
      return `<ul class="task-list">${children}</ul>`;
      
    case 'taskItem':
      const checked = contentNode.attrs?.checked ? ' checked' : '';
      return `<li class="task-item"><input type="checkbox"${checked} disabled /> ${children}</li>`;
      
    default:
      return children;
  }
}

// ============================================================================
// EXPORT TO HTML
// ============================================================================
export function exportToHTML(tiptapJson: TipTapDoc | any): string {
  if (!tiptapJson || !tiptapJson.content) {
    return '';
  }
  
  return tiptapJson.content
    .map((node: ContentNode) => nodeToHTML(node))
    .join('\n');
}

// ============================================================================
// EXPORT NOTE TO FULL HTML DOCUMENT
// ============================================================================
export function exportNoteToHTMLDocument(
  title: string,
  tiptapJson: TipTapDoc,
  createdAt?: Date,
  updatedAt?: Date
): string {
  const content = exportToHTML(tiptapJson);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #1f2937;
      background: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5rem; margin-bottom: 1rem; }
    h1 { font-size: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; }
    p { margin: 1rem 0; }
    ul, ol { margin: 1rem 0; padding-left: 2rem; }
    blockquote {
      border-left: 4px solid #6366f1;
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      font-style: italic;
    }
    code {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .task-list { list-style: none; padding-left: 0; }
    .task-item { display: flex; align-items: flex-start; gap: 0.5rem; }
    .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>${escapeHTML(title)}</h1>
  ${createdAt || updatedAt ? `
  <div class="meta">
    ${createdAt ? `<span>Created: ${createdAt.toLocaleDateString()}</span>` : ''}
    ${updatedAt ? `<span>Updated: ${updatedAt.toLocaleDateString()}</span>` : ''}
  </div>
  ` : ''}
  ${content}
</body>
</html>`;
}

// ============================================================================
// DOWNLOAD HTML FILE
// ============================================================================
export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}
