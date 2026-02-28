/**
 * AI UI Components
 *
 * Svelte 5 components for AI-powered features
 */

// Export component types
export interface GhostTextProps {
  text: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export interface AISuggestionProps {
  suggestion: {
    text: string;
    confidence: number;
    explanation?: string;
  };
  onAccept: () => void;
  onDismiss: () => void;
}

export interface TagSuggestionProps {
  tag: string;
  confidence: number;
  isNew: boolean;
  reason?: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export interface AIStatusProps {
  isActive: boolean;
  feature: string;
  progress?: {
    current: number;
    total: number;
  };
}

// Confidence indicator component helper
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return "var(--ui-success, #10b981)";
  if (confidence >= 0.7) return "var(--ui-info, #3b82f6)";
  if (confidence >= 0.5) return "var(--ui-warning, #f59e0b)";
  return "var(--ui-muted, #9ca3af)";
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "Very High";
  if (confidence >= 0.7) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

// Format confidence as dots
export function formatConfidenceDots(
  confidence: number,
  total: number = 5,
): string {
  const filled = Math.round(confidence * total);
  return "●".repeat(filled) + "○".repeat(total - filled);
}
