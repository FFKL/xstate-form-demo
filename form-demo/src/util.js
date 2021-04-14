export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function renderView(root$, name) {
  const formTemplate = document.querySelector(`template[js-view="${name}"]`);
  const clone = formTemplate.content.cloneNode(true);
  root$.innerHTML = '';
  root$.appendChild(clone);

  return clone;
}