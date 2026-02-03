// ============================================================================
// EXPORT SERVICE
// ============================================================================
// Convert TipTap/ProseMirror content to various formats

import type { JSONContent } from '@tiptap/core';

export type ExportFormat = 'markdown' | 'html' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeTitle?: boolean;
  title?: string;
}

/**
 * Export note content to specified format
 */
export async function exportNote(
  content: JSONContent,
  options: ExportOptions
): Promise<Blob | string> {
  switch (options.format) {
    case 'markdown':
      return convertToMarkdown(content, options);
    case 'html':
      return convertToHTML(content, options);
    case 'pdf':
      return convertToPDF(content, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Convert TipTap JSON to Markdown
 */
function convertToMarkdown(
  content: JSONContent,
  options: ExportOptions
): string {
  let markdown = '';
  
  if (options.includeTitle && options.title) {
    markdown += `# ${options.title}\n\n`;
  }
  
  markdown += convertNodeToMarkdown(content);
  
  return markdown;
}

/**
 * Recursively convert TipTap node to Markdown
 */
function convertNodeToMarkdown(node: JSONContent): string {
  if (!node) return '';
  
  // Handle text nodes
  if (node.type === 'text') {
    let text = node.text || '';
    
    // Apply marks (formatting)
    if (node.marks) {
      node.marks.forEach(mark => {
        switch (mark.type) {
          case 'bold':
            text = `**${text}**`;
            break;
          case 'italic':
            text = `_${text}_`;
            break;
          case 'code':
            text = `\`${text}\``;
            break;
          case 'strike':
            text = `~~${text}~~`;
            break;
          case 'link':
            if (mark.attrs?.href) {
              text = `[${text}](${mark.attrs.href})`;
            }
            break;
        }
      });
    }
    
    return text;
  }
  
  // Handle container nodes
  let result = '';
  
  switch (node.type) {
    case 'doc':
      result = (node.content || []).map(convertNodeToMarkdown).join('');
      break;
      
    case 'paragraph':
      result = (node.content || []).map(convertNodeToMarkdown).join('');
      result += '\n\n';
      break;
      
    case 'heading':
      const level = node.attrs?.level || 1;
      const hashes = '#'.repeat(level);
      const headingText = (node.content || []).map(convertNodeToMarkdown).join('');
      result = `${hashes} ${headingText}\n\n`;
      break;
      
    case 'bulletList':
      result = (node.content || []).map((item: JSONContent) => {
        const itemText = (item.content || []).map(convertNodeToMarkdown).join('');
        return `- ${itemText.trim()}`;
      }).join('\n') + '\n\n';
      break;
      
    case 'orderedList':
      let counter = 1;
      result = (node.content || []).map((item: JSONContent) => {
        const itemText = (item.content || []).map(convertNodeToMarkdown).join('');
        return `${counter++}. ${itemText.trim()}`;
      }).join('\n') + '\n\n';
      break;
      
    case 'taskList':
      result = (node.content || []).map((item: JSONContent) => {
        const checked = item.attrs?.checked ? '[x]' : '[ ]';
        const itemText = (item.content || []).map(convertNodeToMarkdown).join('');
        return `- ${checked} ${itemText.trim()}`;
      }).join('\n') + '\n\n';
      break;
      
    case 'blockquote':
      const quoteText = (node.content || []).map(convertNodeToMarkdown).join('');
      result = quoteText.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
      break;
      
    case 'codeBlock':
      const language = node.attrs?.language || '';
      const codeText = (node.content || []).map(convertNodeToMarkdown).join('');
      result = `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
      break;
      
    case 'horizontalRule':
      result = '---\n\n';
      break;
      
    default:
      if (node.content) {
        result = node.content.map(convertNodeToMarkdown).join('');
      }
  }
  
  return result;
}

/**
 * Convert TipTap JSON to HTML
 */
function convertToHTML(
  content: JSONContent,
  options: ExportOptions
): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || 'Exported Note'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 { color: #111; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    ul, ol { padding-left: 24px; }
    input[type="checkbox"] { margin-right: 8px; }
  </style>
</head>
<body>
`;
  
  if (options.includeTitle && options.title) {
    html += `<h1>${escapeHtml(options.title)}</h1>\n`;
  }
  
  html += convertNodeToHTML(content);
  
  html += '\n</body>\n</html>';
  
  return html;
}

/**
 * Recursively convert TipTap node to HTML
 */
function convertNodeToHTML(node: JSONContent): string {
  if (!node) return '';
  
  // Handle text nodes
  if (node.type === 'text') {
    let text = escapeHtml(node.text || '');
    
    if (node.marks) {
      node.marks.forEach(mark => {
        switch (mark.type) {
          case 'bold':
            text = `<strong>${text}</strong>`;
            break;
          case 'italic':
            text = `<em>${text}</em>`;
            break;
          case 'code':
            text = `<code>${text}</code>`;
            break;
          case 'strike':
            text = `<del>${text}</del>`;
            break;
          case 'link':
            if (mark.attrs?.href) {
              text = `<a href="${escapeHtml(mark.attrs.href)}">${text}</a>`;
            }
            break;
          case 'highlight':
            const color = mark.attrs?.color || 'yellow';
            text = `<mark style="background-color: ${color}">${text}</mark>`;
            break;
        }
      });
    }
    
    return text;
  }
  
  let result = '';
  const content = (node.content || []).map(convertNodeToHTML).join('');
  
  switch (node.type) {
    case 'doc':
      result = content;
      break;
      
    case 'paragraph':
      result = `<p>${content}</p>\n`;
      break;
      
    case 'heading':
      const level = node.attrs?.level || 1;
      result = `<h${level}>${content}</h${level}>\n`;
      break;
      
    case 'bulletList':
      result = `<ul>\n${content}</ul>\n`;
      break;
      
    case 'orderedList':
      result = `<ol>\n${content}</ol>\n`;
      break;
      
    case 'taskList':
      result = `<ul class="task-list">\n${content}</ul>\n`;
      break;
      
    case 'listItem':
      result = `  <li>${content}</li>\n`;
      break;
      
    case 'taskItem':
      const checked = node.attrs?.checked ? 'checked' : '';
      result = `  <li><input type="checkbox" ${checked} disabled> ${content}</li>\n`;
      break;
      
    case 'blockquote':
      result = `<blockquote>${content}</blockquote>\n`;
      break;
      
    case 'codeBlock':
      const language = node.attrs?.language || '';
      result = `<pre><code class="language-${language}">${content}</code></pre>\n`;
      break;
      
    case 'horizontalRule':
      result = '<hr>\n';
      break;
      
    case 'hardBreak':
      result = '<br>';
      break;
      
    default:
      result = content;
  }
  
  return result;
}

/**
 * Convert TipTap JSON to PDF (using html2pdf.js)
 */
async function convertToPDF(
  content: JSONContent,
  options: ExportOptions
): Promise<Blob> {
  // First convert to HTML
  const html = convertToHTML(content, options);
  
  // Create a temporary element
  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.width = '800px';
  element.style.padding = '40px';
  document.body.appendChild(element);
  
  try {
    // Dynamically import html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt: any = {
      margin: 10,
      filename: `${options.filename || options.title || 'note'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
    return pdfBlob;
  } finally {
    document.body.removeChild(element);
  }
}

/**
 * Download exported content
 */
export function downloadExport(
  content: Blob | string,
  filename: string,
  mimeType: string
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'markdown':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'text/plain';
  }
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'markdown':
      return 'md';
    case 'html':
      return 'html';
    case 'pdf':
      return 'pdf';
    default:
      return 'txt';
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
