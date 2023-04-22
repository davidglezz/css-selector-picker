import './style.css';
import { getSelector } from './css-selector-picker.ts';

document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelector<HTMLButtonElement>('#selector');
  document.addEventListener('mouseover', (e) => {
    let cssSelectorStr = getSelector(e.target as Element);
    element!.innerHTML = `${cssSelectorStr}`;

    try {
      document
        .querySelectorAll('[data-highlight]')
        .forEach((e) => e.removeAttribute('data-highlight'));
      document
        .querySelectorAll(cssSelectorStr)
        .forEach((e) => e.setAttribute('data-highlight', '1'));
    } catch (error) {}
  });
});
