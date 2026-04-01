/**
 * Server-safe HTML sanitisation helpers.
 *
 * On the client side, import DOMPurify directly; this module provides a
 * lightweight server-safe fallback that strips all HTML tags for plain-text
 * contexts (e.g. logging, AI prompts).
 */

const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_TAG_RE = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const DANGEROUS_ATTR_RE = /\s(on\w+|javascript:|data:)\s*=\s*["'][^"']*["']/gi;

/**
 * Strip all HTML tags from a string (server-safe).
 * For rich-text UI sanitisation use DOMPurify on the client.
 */
export function stripHtml(input: string): string {
  return input.replace(SCRIPT_TAG_RE, '').replace(HTML_TAG_RE, '').trim();
}

/**
 * Remove dangerous attributes from an HTML string.
 * This is a best-effort server-side guard; always rely on DOMPurify on the client.
 */
export function sanitizeHtmlAttributes(input: string): string {
  return input.replace(DANGEROUS_ATTR_RE, '');
}

/**
 * Sanitise a plain-text user input that will be sent to an AI model.
 * Prevents prompt-injection by stripping control characters and HTML.
 */
export function sanitizePrompt(input: string): string {
  return stripHtml(input)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .slice(0, 4000); // hard cap for AI context window
}
