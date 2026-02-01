// ============================================================================
// MARKDOWN EXPORT
// ============================================================================
// Converts TipTap JSON content to Markdown format.
//
// SUPPORTED FORMATTING:
// - Headings (# ## ###)
// - Bold (**text**)
// - Italic (*text*)
// - Strikethrough (~~text~~)
// - Code (`code`)
// - Code blocks (```lang\ncode```)
// - Blockquotes (> text)
// - Bullet lists (- item)
// - Ordered lists (1. item)
// - Links [text](url)
// - Horizontal rules (---)
//
// USAGE:
// import { exportToMarkdown } from '$lib/export/markdown';
// const markdown = exportToMarkdown(editor.getJSON());
// downloadMarkdown(markdown, 'my-note.md');
// ============================================================================

// Type declarations for browser APIs
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
// CONVERT TEXT NODE TO MARKDOWN
// ============================================================================
function textNodeToMarkdown(node: TextNode): string {
  let text = node.text;
  
  if (node.marks) {
    // Apply marks in reverse order (innermost first)
    for (const mark of [...node.marks].reverse()) {
      switch (mark.type) {
        case 'bold':
        case 'strong':
          text = `**${text}**`;
          break;
        case 'italic':
        case 'em':
          text = `*${text}*`;
          break;
        case 'strike':
        case 's':
          text = `~~${text}~~`;
          break;
        case 'code':
          text = `\`${text}\``;
          break;
        case 'link':
          const href = mark.attrs?.href || '#';
          text = `[${text}](${href})`;
          break;
      }
    }
  }
  
  return text;
}

// ============================================================================
// CONVERT NODE TO MARKDOWN
// ============================================================================
function nodeToMarkdown(node: ContentNode | TextNode, depth: number = 0): string {
  // Handle text nodes
  if (isTextNode(node)) {
    return textNodeToMarkdown(node);
  }
  
  // At this point, node is ContentNode (not TextNode)
  const contentNode = node as ContentNode;
  const content = contentNode.content || [];
  const children = content.map((child: ContentNode | TextNode) => 
    nodeToMarkdown(child, depth + 1)
  ).join('');
  
  switch (contentNode.type) {
    case 'paragraph':
      return `${children}\n\n`;
      
    case 'heading':
      const level = contentNode.attrs?.level || 1;
      const hashes = Array(Math.min(level, 6) + 1).join('#');
      return `${hashes} ${children}\n\n`;
      
    case 'bulletList':
      return content.map((item: ContentNode | TextNode) => {
        if (!isContentNode(item)) return '';
        const itemContent = (item.content || []).map((child: ContentNode | TextNode) => 
          nodeToMarkdown(child, depth + 1)
        ).join('').trim();
        return `- ${itemContent}`;
      }).join('\n') + '\n\n';
      
    case 'orderedList':
      return content.map((item: ContentNode | TextNode, index: number) => {
        if (!isContentNode(item)) return '';
        const itemContent = (item.content || []).map((child: ContentNode | TextNode) => 
          nodeToMarkdown(child, depth + 1)
        ).join('').trim();
        return `${index + 1}. ${itemContent}`;
      }).join('\n') + '\n\n';
      
    case 'blockquote':
      const quoted = children.split('\n').map((line: string) => `> ${line}`).join('\n');
      return `${quoted}\n\n`;
      
    case 'codeBlock':
      const language = contentNode.attrs?.language || '';
      return `\`\`\`${language}\n${children.trim()}\n\`\`\`\n\n`;
      
    case 'horizontalRule':
      return `---\n\n`;
      
    case 'hardBreak':
      return '\n';
      
    default:
      return children;
  }
}

// ============================================================================
// EXPORT TO MARKDOWN
// ============================================================================
export function exportToMarkdown(tiptapJson: TipTapDoc | any): string {
  if (!tiptapJson || !tiptapJson.content) {
    return '';
  }
  
  return tiptapJson.content
    .map((node: ContentNode) => nodeToMarkdown(node))
    .join('')
    .trim();
}

// ============================================================================
// DOWNLOAD MARKDOWN FILE
// ============================================================================
export function downloadMarkdown(markdown: string, filename: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

// ============================================================================
// EXPORT NOTE TO MARKDOWN (with metadata)
// ============================================================================
export function exportNoteToMarkdown(
  title: string,
  tiptapJson: TipTapDoc,
  createdAt?: Date,
  updatedAt?: Date
): string {
  let markdown = '';
  
  // Add metadata header
  markdown += `---\n`;
  markdown += `title: ${title}\n`;
  if (createdAt) {
    markdown += `created: ${createdAt.toISOString()}\n`;
  }
  if (updatedAt) {
    markdown += `updated: ${updatedAt.toISOString()}\n`;
  }
  markdown += `---\n\n`;
  
  // Add title as heading
  markdown += `# ${title}\n\n`;
  
  // Add content
  markdown += exportToMarkdown(tiptapJson);
  
  return markdown;
}
