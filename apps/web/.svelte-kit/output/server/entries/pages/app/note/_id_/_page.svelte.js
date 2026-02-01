import { G as attributes, y as stringify, x as attr_class, F as head } from "../../../../../chunks/index.js";
import { p as page, g as goto } from "../../../../../chunks/index3.js";
import "@tiptap/starter-kit";
import "@tiptap/extension-collaboration";
import "@tiptap/extension-collaboration-cursor";
import "@tiptap/extension-placeholder";
import "@tiptap/extension-highlight";
import "@tiptap/extension-task-list";
import "@tiptap/extension-task-item";
import "@tiptap/extension-typography";
import "tweetnacl";
import "tweetnacl-util";
import { a as attr } from "../../../../../chunks/attributes.js";
import "idb";
import { a as auth } from "../../../../../chunks/auth.svelte.js";
import { k as escape_html } from "../../../../../chunks/escaping.js";
function Button($$renderer, $$props) {
  let {
    variant = "primary",
    // Default to primary style
    size = "md",
    // Default to medium size
    loading = false,
    // Default not loading
    fullWidth = false,
    // Default not full width
    disabled = false,
    // Default not disabled
    type = "button",
    // Default type (not submit)
    children,
    // Required: button content
    class: className = "",
    // Custom CSS classes
    $$slots,
    $$events,
    ...restProps
    // Any other button attributes
  } = $$props;
  const baseClasses = `                                          
		inline-flex items-center justify-center gap-2               
		font-medium rounded-lg                                      
		transition-colors duration-150                              
		focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed             
	`;
  const variantClasses = {
    primary: `
			bg-indigo-600 text-white                                  
			hover:bg-indigo-700                                       
			focus-visible:ring-indigo-500                             
		`,
    secondary: `
			bg-white text-gray-700 border border-gray-300             
			hover:bg-gray-50                                          
			focus-visible:ring-indigo-500                             
			dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600  
			dark:hover:bg-gray-700                                    
		`,
    danger: `
			bg-red-600 text-white                                     
			hover:bg-red-700                                          
			focus-visible:ring-red-500                                
		`,
    ghost: `
			bg-transparent text-gray-700                              
			hover:bg-gray-100                                         
			focus-visible:ring-indigo-500                             
			dark:text-gray-200 dark:hover:bg-gray-800                 
		`
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    // Small: compact padding
    md: "px-4 py-2 text-base",
    // Medium: standard padding
    lg: "px-6 py-3 text-lg"
    // Large: generous padding
  };
  $$renderer.push(`<button${attributes({
    type,
    disabled: disabled || loading,
    "aria-busy": loading,
    class: ` ${stringify(baseClasses)} ${stringify(variantClasses[variant])} ${stringify(sizeClasses[size])} ${stringify(fullWidth ? "w-full" : "")} ${stringify(className)} `,
    ...restProps
  })}>`);
  if (loading) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--> `);
  children($$renderer);
  $$renderer.push(`<!----></button>`);
}
const __vite_import_meta_env__ = {};
(() => {
  if (typeof import.meta !== "undefined" && __vite_import_meta_env__?.VITE_SIGNALING_URL) {
    return void 0;
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "ws://localhost:8787";
  }
  console.warn("[WebRTC] No VITE_SIGNALING_URL set, using placeholder");
  return "wss://locanote-signaling.your-subdomain.workers.dev";
})();
function Toolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="sticky top-0 z-50 mb-4"><div class="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg"><div class="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-gray-700"><button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Bold (Ctrl+B)"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z"></path></svg></button> <button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Italic (Ctrl+I)"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg></button> <button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Strikethrough"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 16v-6m12 6v-6M6 12h12M6 8h12"></path></svg></button> <button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Highlight"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg></button></div> <div class="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700"><button${attr_class(`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Heading 1">H1</button> <button${attr_class(`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Heading 2">H2</button> <button${attr_class(`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Heading 3">H3</button></div> <div class="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700"><button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Bullet List"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button> <button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Numbered List"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg></button> <button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Task List"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg></button></div> <div class="flex items-center gap-0.5 pl-2"><button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Quote"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg></button> <button${attr_class(`p-2 rounded-lg transition-all duration-200 ${stringify("text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}`)} title="Code Block"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg></button> <button class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200" title="Divider"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button></div> <div class="flex items-center gap-0.5 pl-2 ml-auto border-l border-gray-200 dark:border-gray-700"><button${attr("disabled", true, true)} class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg></button> <button${attr("disabled", true, true)} class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg></button></div></div></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    page.params.id;
    ({
      name: auth.session?.username || "Anonymous",
      id: auth.session?.userId || "anonymous"
    });
    function goBack() {
      goto();
    }
    head("pwfqed", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Note")} - Locanote</title>`);
      });
    });
    $$renderer2.push(`<div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-950"><header class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"><div class="flex items-center gap-4">`);
    Button($$renderer2, {
      variant: "ghost",
      size: "sm",
      onclick: goBack,
      children: ($$renderer3) => {
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> <span class="ml-2">Back</span>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2"><div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"><span${attr_class(`w-2 h-2 rounded-full ${stringify("bg-red-500")}`)}></span> <span class="text-gray-600 dark:text-gray-300 hidden sm:inline">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`Offline`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></span></div> `);
    Button($$renderer2, {
      variant: "secondary",
      size: "sm",
      children: ($$renderer3) => {
        $$renderer3.push(`<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> <span class="ml-2 hidden sm:inline">Share</span>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></header> `);
    Toolbar($$renderer2);
    $$renderer2.push(`<!----> <main class="flex-1 overflow-hidden p-4">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-full"><div class="flex flex-col items-center gap-3"><div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div> <span class="text-sm text-gray-500 dark:text-gray-400">Loading note...</span></div></div>`);
    }
    $$renderer2.push(`<!--]--></main></div>`);
  });
}
export {
  _page as default
};
