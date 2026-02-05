<!-- =========================================================================
TOAST COMPONENT (Toast.svelte)
============================================================================
A notification toast that appears temporarily to show messages.

TYPES OF TOASTS:
- success: Green, for successful actions
- error: Red, for errors
- info: Blue, for informational messages
- warning: Yellow, for warnings

USAGE EXAMPLES:
<Toast type="success" message="Note saved!" />
<Toast type="error" message="Failed to save" onclose={() => toast = null} />
========================================================================== -->

<script lang="ts">
  // ========================================================================
  // TYPE DEFINITIONS
  // ========================================================================
  type Props = {
    type?: "success" | "error" | "info" | "warning"; // Toast type
    message: string; // Message to display
    duration?: number; // Auto-dismiss after ms (0 = no auto)
    onclose?: () => void; // Callback when closed
  };

  // ========================================================================
  // PROPS (with defaults)
  // ========================================================================
  let {
    type = "info", // Default to info type
    message, // Required message
    duration = 5000, // Default 5 seconds
    onclose, // Optional close callback
  }: Props = $props();

  // ========================================================================
  // STATE
  // ========================================================================
  let visible = $state(true); // Whether toast is visible

  // ========================================================================
  // AUTO-DISMISS
  // ========================================================================
  // Set a timeout to auto-dismiss the toast if duration > 0
  $effect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        visible = false; // Hide toast
        onclose?.(); // Call callback if provided
      }, duration);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  });

  // ========================================================================
  // STYLING
  // ========================================================================
  const typeStyles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20", // Light green background
      border: "border-green-200 dark:border-green-800", // Green border
      text: "text-green-800 dark:text-green-200", // Green text
      icon: "text-green-500", // Green icon
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: "text-red-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: "text-blue-500",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: "text-yellow-500",
    },
  };

  // Get styles for current type (reactive)
  const styles = $derived(typeStyles[type]);

  // ========================================================================
  // CLOSE HANDLER
  // ========================================================================
  function close() {
    visible = false;
    onclose?.();
  }
</script>

<!-- ==========================================================================
TOAST ELEMENT
==========================================================================
Only rendered when visible is true.
Uses transition for smooth enter/exit animations.
=========================================================================== -->
{#if visible}
  <div
    role="alert"
    class="
			flex items-center gap-3 p-4
			rounded-lg border shadow-lg
			{styles.bg} {styles.border} {styles.text}
		"
  >
    <!-- ====================================================================
		ICON
		====================================================================
		Different icon for each toast type.
		==================================================================== -->
    <div class={styles.icon}>
      {#if type === "success"}
        <!-- Checkmark icon -->
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      {:else if type === "error"}
        <!-- X circle icon -->
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {:else if type === "warning"}
        <!-- Exclamation icon -->
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      {:else}
        <!-- Info icon -->
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {/if}
    </div>

    <!-- ====================================================================
		MESSAGE
		====================================================================
		The actual toast message.
		==================================================================== -->
    <p class="flex-1 text-sm font-medium">
      {message}
    </p>

    <!-- ====================================================================
		CLOSE BUTTON
		====================================================================
		X button to manually dismiss the toast.
		==================================================================== -->
    <button
      type="button"
      onclick={close}
      class="
				p-1 rounded-lg opacity-70
				hover:opacity-100 hover:bg-black/5
				focus:outline-none focus-visible:ring-2 focus-visible:ring-current
			"
      aria-label="Dismiss"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
{/if}
