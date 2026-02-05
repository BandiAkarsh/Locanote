import os

file_path = "apps/web/src/routes/app/settings/+page.svelte"

with open(file_path, "r") as f:
    content = f.read()

# 1. Add Import
import_marker = 'import { fly, fade } from "svelte/transition";'
new_import = 'import { isBrowser } from "/browser";'

if new_import not in content:
    content = content.replace(import_marker, import_marker + "\n  " + new_import)

# 2. Add goBack function
# Find a good place to insert. Maybe before handleLogout
func_marker = 'function handleLogout() {'
go_back_func = """
  function goBack() {
    // Smart Back: Use history if available, else fallback to dashboard
    if (isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/app");
    }
  }

"""

if "function goBack()" not in content:
    content = content.replace(func_marker, go_back_func + "  " + func_marker)

# 3. Replace Header
# I'll use a precise replacement based on the known structure
old_header_start = '<header'
old_header_end = '</header>'

# Find the specific header block
start_idx = content.find(old_header_start)
end_idx = content.find(old_header_end, start_idx) + len(old_header_end)

if start_idx != -1:
    old_header = content[start_idx:end_idx]
    
    new_header = """<header
    class="flex items-start sm:items-center gap-4 sm:gap-6 mb-8"
    in:fly={{ y: -20 }}
  >
    <button
      onclick={goBack}
      class="mt-1 sm:mt-0 p-3 glass-2 rounded-2xl text-[var(--ui-text-muted)] hover:text-primary transition-all hover:scale-110 active:scale-95 shrink-0"
      aria-label="Go Back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
      >
    </button>

    <div>
      <h1
        class="text-4xl sm:text-5xl font-black text-[var(--ui-text)] tracking-tighter"
      >
        System Console
      </h1>
      <p class="text-[var(--ui-text-muted)] font-medium">
        Configure your neural link and environment.
      </p>
    </div>
  </header>"""

    content = content.replace(old_header, new_header)

with open(file_path, "w") as f:
    f.write(content)

print("Successfully updated settings page.")
