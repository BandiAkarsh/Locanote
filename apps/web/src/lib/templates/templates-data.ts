// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================
// Pre-built note templates with structured content

import type { NoteTemplate } from './types';

/**
 * Meeting Notes Template
 */
export const meetingNotesTemplate: NoteTemplate = {
  id: 'meeting-notes',
  name: 'Meeting Notes',
  description: 'Capture meeting details, attendees, and action items',
  icon: 'users',
  defaultTitle: 'Meeting Notes',
  defaultTags: ['meeting', 'work'],
  category: 'work',
  color: '#6366f1',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Meeting Notes' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Date: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Enter date]' }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Attendees: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[List attendees]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Agenda' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Topic 1]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Topic 2]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Discussion' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Key discussion points]' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Action Items' }]
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [
                { type: 'text', text: '[Action] - @', marks: [{ type: 'bold' }] },
                { type: 'text', text: '[Owner]' }
              ]
            }]
          }
        ]
      }
    ]
  }
};

/**
 * Daily Journal Template
 */
export const dailyJournalTemplate: NoteTemplate = {
  id: 'daily-journal',
  name: 'Daily Journal',
  description: 'Reflect on your day, track mood, and set goals',
  icon: 'book-open',
  defaultTitle: 'Daily Journal',
  defaultTags: ['journal', 'personal'],
  category: 'personal',
  color: '#10b981',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Daily Journal' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Date: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Today\'s date]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Morning Intention' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[How do you want to feel today?]' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Gratitude' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Something you are grateful for]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Another gratitude item]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Today\'s Highlights' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[What went well today?]' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Reflections' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[What did you learn? What would you do differently?]' }]
      }
    ]
  }
};

/**
 * Project Plan Template
 */
export const projectPlanTemplate: NoteTemplate = {
  id: 'project-plan',
  name: 'Project Plan',
  description: 'Outline project objectives, timeline, and deliverables',
  icon: 'target',
  defaultTitle: 'Project Plan',
  defaultTags: ['project', 'planning'],
  category: 'work',
  color: '#3b82f6',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Project Plan' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Project Name: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Enter project name]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Objectives' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Objective 1]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Objective 2]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Timeline' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Start Date: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Date]' }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'End Date: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Date]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Tasks' }]
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Task 1 - Priority: High]' }]
            }]
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Task 2 - Priority: Medium]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Resources' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Team members, budget, tools needed]' }]
      }
    ]
  }
};

/**
 * Recipe Template
 */
export const recipeTemplate: NoteTemplate = {
  id: 'recipe',
  name: 'Recipe',
  description: 'Store your favorite recipes with ingredients and instructions',
  icon: 'utensils',
  defaultTitle: 'Recipe',
  defaultTags: ['recipe', 'cooking'],
  category: 'personal',
  color: '#f59e0b',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Recipe Name' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Prep Time: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[XX minutes] | ' },
          { type: 'text', text: 'Cook Time: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[XX minutes] | ' },
          { type: 'text', text: 'Servings: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[X]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Ingredients' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Amount] [Ingredient]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Amount] [Ingredient]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Instructions' }]
      },
      {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Step 1]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Step 2]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Notes' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Tips, substitutions, or variations]' }]
      }
    ]
  }
};

/**
 * Weekly Review Template
 */
export const weeklyReviewTemplate: NoteTemplate = {
  id: 'weekly-review',
  name: 'Weekly Review',
  description: 'Reflect on your week and plan for the next',
  icon: 'calendar',
  defaultTitle: 'Weekly Review',
  defaultTags: ['review', 'planning'],
  category: 'work',
  color: '#8b5cf6',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Weekly Review' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Week: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Date range]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Wins' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Accomplishment 1]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Accomplishment 2]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Challenges' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[What was difficult? What blocked you?]' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Lessons Learned' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Key insights from this week]' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Next Week Focus' }]
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Priority 1 for next week]' }]
            }]
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Priority 2]' }]
            }]
          }
        ]
      }
    ]
  }
};

/**
 * Book Notes Template
 */
export const bookNotesTemplate: NoteTemplate = {
  id: 'book-notes',
  name: 'Book Notes',
  description: 'Capture insights and quotes from your reading',
  icon: 'book-marked',
  defaultTitle: 'Book Notes',
  defaultTags: ['reading', 'learning'],
  category: 'education',
  color: '#d946ef',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Book Title' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Author: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Author Name]' }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Date Read: ', marks: [{ type: 'bold' }] },
          { type: 'text', text: '[Date]' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Summary' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Brief overview of the book]' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Key Takeaways' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Key insight 1]' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Key insight 2]' }]
            }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Favorite Quotes' }]
      },
      {
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: '[Quote 1 - Page X]' }]
        }]
      },
      {
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: '[Quote 2 - Page Y]' }]
        }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Action Items' }]
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '[Apply lesson from book]' }]
            }]
          }
        ]
      }
    ]
  }
};

/**
 * Blank Template (Default)
 */
export const blankTemplate: NoteTemplate = {
  id: 'blank',
  name: 'Blank Note',
  description: 'Start with a clean slate',
  icon: 'file-text',
  defaultTitle: 'Untitled Note',
  defaultTags: [],
  category: 'personal',
  color: '#6b7280',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Start typing your ideas...' }]
      }
    ]
  }
};

/**
 * All available templates
 */
export const allTemplates: NoteTemplate[] = [
  meetingNotesTemplate,
  dailyJournalTemplate,
  projectPlanTemplate,
  recipeTemplate,
  weeklyReviewTemplate,
  bookNotesTemplate,
  blankTemplate
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): NoteTemplate | undefined {
  return allTemplates.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): NoteTemplate[] {
  if (category === 'all') return allTemplates;
  return allTemplates.filter(t => t.category === category);
}
