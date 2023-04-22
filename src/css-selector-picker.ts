/**
 * @author David Gonzalez Garcia (https://github.com/davidglezz)
 * Based on https://github.com/ChromeDevTools/devtools-frontend/blob/f7eb6fdc4c780d046fd73e0182efbddec4f0535b/front_end/panels/elements/DOMPath.ts#L14
 */

export function getSelector(node: Element): string {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const selectorPart: string[] = [];
  let contextNode = node;
  while (contextNode) {
    const [selector, isFirst] = cssPathStep(contextNode, contextNode === node);
    if (!selector) {
      break;
    }
    selectorPart.push(selector);
    if (isFirst) {
      break;
    }
    contextNode = contextNode.parentNode as Element;
  }

  return selectorPart.reverse().join(' > ');
}

function cssPathStep(
  node: Element,
  isTarget: boolean
): [selector: string, isFirst: boolean] {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ['', true];
  }

  if (node.id) {
    return [`#${CSS.escape(node.id)}`, true];
  }

  if (
    !node.parentNode ||
    node.parentNode.nodeType === Node.DOCUMENT_NODE ||
    ['body', 'head', 'html'].includes(node.localName)
  ) {
    return [node.localName, true];
  }

  let needsClassNames = false;
  let needsNthChild = false;
  let ownIndex = 0;
  let noElementCount = 0;
  const ownClassNames = [...node.classList];
  const siblings = node.parentNode.children ?? [];
  for (
    let i = 0;
    (ownIndex === 0 || !needsNthChild) && i < siblings.length;
    ++i
  ) {
    const sibling = siblings[i];
    if (sibling.nodeType !== Node.ELEMENT_NODE) {
      noElementCount += 1;
      continue;
    }
    if (sibling === node) {
      ownIndex = i - noElementCount + 1;
      continue;
    }
    if (needsNthChild || sibling.localName !== node.localName) {
      continue;
    }
    needsClassNames = true;
    if (
      !ownClassNames.length ||
      ownClassNames.every((c) => sibling.classList.contains(c))
    ) {
      needsNthChild = true;
      continue;
    }
  }

  let result = node.localName;
  const nodeTypeAttr = node.getAttribute('type');
  if (
    isTarget &&
    node.localName === 'input' &&
    nodeTypeAttr &&
    !node.id &&
    !node.classList.length
  ) {
    result += `[type=${CSS.escape(nodeTypeAttr)}]`;
  }
  if (needsNthChild) {
    result += `:nth-child(${ownIndex})`;
  } else if (needsClassNames) {
    result += [...node.classList].map((c) => `.${CSS.escape(c)}`).join('');
  }

  return [result, false];
}
