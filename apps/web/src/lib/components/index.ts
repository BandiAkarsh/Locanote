// ============================================================================
// COMPONENTS INDEX
// ============================================================================
// This file exports all UI components from a single location.
// This makes imports cleaner throughout the app.
//
// USAGE:
// import { Button, Input, Modal } from '$components';
//
// INSTEAD OF:
// import Button from '$lib/components/Button.svelte';
// import Input from '$lib/components/Input.svelte';
// import Modal from '$lib/components/Modal.svelte';
// ============================================================================

export { default as Button } from "./Button.svelte"; // Reusable button component
export { default as Input } from "./Input.svelte"; // Text input with label/error
export { default as Modal } from "./Modal.svelte"; // Popup dialog component
export { default as Spinner } from "./Spinner.svelte"; // Loading spinner animation
export { default as Toast } from "./Toast.svelte"; // Notification toast messages
export { default as AuthCard } from "./AuthCard.svelte"; // Beautiful authentication card
export { default as RegisterCard } from "./RegisterCard.svelte"; // Beautiful registration card
export { default as OfflineBanner } from "./OfflineBanner.svelte"; // Offline status indicator
export { default as TagBadge } from "./TagBadge.svelte"; // Tag display component
export { default as Toggle } from "./Toggle.svelte"; // Reusable toggle switch component
export { default as ShareModal } from "./ShareModal.svelte"; // Social sharing modal
export { default as TemplateModal } from "./TemplateModal.svelte"; // Template selection modal
export { default as SearchBar } from "./SearchBar.svelte"; // Search input with filters
export { default as ExportModal } from "./ExportModal.svelte"; // Export to MD/HTML/PDF
export { default as ThemeBackground } from "./ThemeBackground.svelte"; // Animated background
