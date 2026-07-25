const ALIASES = {
  event_bubbling: ['event bubbling', 'bubbling', 'event propagation', 'dom events'],
  event_loop: ['event loop', 'call stack', 'microtask', 'task queue', 'js runtime'],
  binary_search: ['binary search', 'bsearch'],
  merge_sort: ['merge sort', 'mergesort'],
  stack: ['stack', 'lifo', 'call stack memory'],
  queue: ['queue', 'fifo'],
  trees: ['tree', 'trees', 'binary tree', 'bst'],
  graphs: ['graph', 'graphs', 'bfs', 'dfs', 'adjacency'],
  virtual_dom: ['virtual dom', 'vdom', 'reconciliation', 'diffing'],
  react_lifecycle: ['react lifecycle', 'lifecycle', 'component lifecycle', 'useeffect'],
  promises: ['promise', 'promises', 'async await', 'async/await'],
  closures: ['closure', 'closures', 'lexical scope'],
};

export function matchConceptKey(raw) {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (ALIASES[slug]) return slug;

  const flat = raw.trim().toLowerCase();
  for (const [key, phrases] of Object.entries(ALIASES)) {
    if (phrases.some((p) => flat.includes(p))) return key;
  }
  return null;
}
