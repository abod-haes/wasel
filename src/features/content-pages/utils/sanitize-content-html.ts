/**
 * Display-only HTML allowlist. Create a fresh safe DOM tree rather than
 * reusing untrusted input elements, their attributes, or inline event handlers.
 * The API already sanitizes persisted HTML; this is a second browser boundary.
 */
const permittedTags = new Set([
  'h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i',
  'u', 's', 'ul', 'ol', 'li', 'blockquote', 'a', 'hr', 'div', 'span',
]);
const blockedWithContents = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'svg', 'math',
  'form', 'input', 'button', 'select', 'textarea', 'video', 'audio',
  'link', 'meta', 'base', 'template',
]);

export function sanitizeContentHtml(html: string): string {
  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') return '';
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const safe = document.createElement('div');
  const append = (node: Node, parent: Node): void => {
    if (node.nodeType === 3) {
      parent.appendChild(document.createTextNode(node.textContent ?? ''));
      return;
    }
    if (node.nodeType !== 1) return;
    const source = node as Element;
    const tag = source.localName.toLowerCase();
    if (blockedWithContents.has(tag)) return;
    if (!permittedTags.has(tag)) {
      source.childNodes.forEach((child) => append(child, parent));
      return;
    }
    const element = document.createElement(tag);
    if (tag === 'a') {
      const href = source.getAttribute('href')?.trim() ?? '';
      if (/^https:\/\//i.test(href) || /^(mailto:|tel:)/i.test(href) ||
        (/^\/(?!\/)/.test(href))) {
        element.setAttribute('href', href);
        element.setAttribute('rel', 'noopener noreferrer');
        element.setAttribute('target', '_blank');
      }
    }
    source.childNodes.forEach((child) => append(child, element));
    parent.appendChild(element);
  };
  parsed.body.childNodes.forEach((node) => append(node, safe));
  return safe.innerHTML;
}
