// ============================================================================
// INTENT DETECTION SERVICE (intent.svelte.ts)
// ============================================================================
// Real-time analysis of editor content to trigger GenUI layout morphs.

export type IntentMode = 'none' | 'recipe' | 'task' | 'code' | 'journal';

class IntentService {
  currentMode = $state<IntentMode>('none');
  
  // High-performance patterns for 2026 adaptive interfaces
  private patterns = {
    recipe: [/ingredients/i, /instructions/i, /prep time/i, /cook time/i, /servings/i, /tsp/i, /tbsp/i, /cups?/i, /oven/i, /degrees/i],
    task: [/todo/i, /tasks?/i, /deadline/i, /priority/i, /assigned to/i, /\[ \]/, /\[x\]/, /done/i, /asap/i],
    code: [/function/i, /const /i, /import /i, /export /i, /class /i, /interface /i, /console\.log/i, /\{[\s\S]*\}/, /=>/, /await /i],
    journal: [/dear diary/i, /gratitude/i, /reflections?/i, /mood:/i, /today was/i, /i feel/i, /grateful/i]
  };

  /**
   * Analyze text and update current mode (GenUI Trigger)
   */
  analyze(text: string) {
    if (!text || text.length < 5) {
      this.currentMode = 'none';
      return;
    }

    const textLower = text.toLowerCase();
    
    // Scoring system for accurate morphing
    for (const [mode, regexes] of Object.entries(this.patterns)) {
      const matchCount = regexes.filter(re => re.test(textLower)).length;
      
      // Intent Threshold: 2 or more matches triggers a morph
      if (matchCount >= 2) {
        if (this.currentMode !== mode) {
          console.log(`[GenUI] Intent Detected: ${mode.toUpperCase()} MODE ACTIVATED`);
          this.currentMode = mode as IntentMode;
        }
        return;
      }
    }

    // Default to none if no strong matches
    this.currentMode = 'none';
  }

  reset() {
    this.currentMode = 'none';
  }
}

export const intent = new IntentService();
