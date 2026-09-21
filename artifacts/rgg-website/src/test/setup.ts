import "@testing-library/jest-dom/vitest";
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.HTMLElement.prototype.hasPointerCapture = () => false;
global.HTMLElement.prototype.setPointerCapture = () => {};
global.HTMLElement.prototype.releasePointerCapture = () => {};

global.HTMLElement.prototype.scrollIntoView = () => {};
