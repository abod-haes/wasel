/**
 * Small allowlist boundary for the business-approved HTML returned by the API.
 * The backend sanitizes at save time too; never trust a response as executable
 * markup. Only formatted text, tables and safe link protocols are retained.
 */
const ALLOWED = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'strong',
  'b', 'em', 'i', 'u', 's', 'br', 'hr', 'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'svg', 'math',
  'form', 'input', 'button', 'textarea', 'select', 'video', 'audio',
  'canvas', 'link', 'meta', 'base', 'template',
]);
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

export function sanitizeContentHtml(input: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(input, 'text/html');
  const clean = (node: Node): void => {
    if (node.nodeType === 8) {
      node.parentNode?.removeChild(node);
      return;
    }
    if (node.nodeType !== 1) return;
    const element = node as Element;
    const name = element.localName.toLowerCase();
    if (element.namespaceURI !== HTML_NAMESPACE || DROP_WITH_CONTENT.has(name)) {
      element.remove();
      return;
    }
    // Traverse a snapshot before unwrapping unknown tags.
    Array.from(element.childNodes).forEach(clean);
    if (name === 'a') {
      const raw = element.getAttribute('href')?.trim() ?? '';
      const safe = /^(https?:\/\/|mailto:|tel:)/i.test(raw);
      Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
      if (safe) {
        element.setAttribute('href', raw);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer nofollow');
      }
      return;
    }
    if (!ALLOWED.has(name)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
  };
  Array.from(doc.body.childNodes).forEach(clean);
  return doc.body.innerHTML;
}
