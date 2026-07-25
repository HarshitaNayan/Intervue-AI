// Each config is consumed by <TeachingVisual/>, which cycles through
// `steps` on a timer. A step shows only `visibleIds` (defaults to all
// nodes), highlights `activeIds`/`activeEdgeIds`, and displays a caption.
// This keeps every concept declarative — no per-concept animation code.

const rect = (id, x, y, label, extra = {}) => ({ id, x, y, label, shape: 'rect', ...extra });
const circle = (id, x, y, label, extra = {}) => ({ id, x, y, label, shape: 'circle', ...extra });

export const CONCEPTS = {
  stack: {
    title: 'Call Stack — LIFO',
    nodes: [
      rect('n0', 140, 118, 'main()'),
      rect('n1', 140, 90, 'init()'),
      rect('n2', 140, 62, 'helper()'),
    ],
    edges: [],
    steps: [
      { visibleIds: ['n0'], activeIds: ['n0'], caption: 'main() runs — pushed onto the stack.' },
      { visibleIds: ['n0', 'n1'], activeIds: ['n1'], caption: 'main() calls init() — pushed on top.' },
      { visibleIds: ['n0', 'n1', 'n2'], activeIds: ['n2'], caption: 'init() calls helper() — pushed again. LIFO: Last In, First Out.' },
      { visibleIds: ['n0', 'n1'], activeIds: ['n1'], caption: 'helper() returns and is popped off the top.' },
      { visibleIds: ['n0'], activeIds: ['n0'], caption: 'init() returns and pops too. main() stays until the program ends.' },
    ],
  },

  queue: {
    title: 'Queue — FIFO',
    nodes: [
      rect('n0', 60, 70, 'req 1'),
      rect('n1', 120, 70, 'req 2'),
      rect('n2', 180, 70, 'req 3'),
    ],
    edges: [],
    steps: [
      { visibleIds: ['n0'], activeIds: ['n0'], caption: 'req 1 enters the queue.' },
      { visibleIds: ['n0', 'n1'], activeIds: ['n1'], caption: 'req 2 enqueued at the back.' },
      { visibleIds: ['n0', 'n1', 'n2'], activeIds: ['n2'], caption: 'req 3 enqueued — still waits behind req 1.' },
      { visibleIds: ['n1', 'n2'], activeIds: ['n1'], caption: 'req 1 dequeued from the front — FIFO: First In, First Out.' },
      { visibleIds: ['n2'], activeIds: ['n2'], caption: 'req 2 dequeued next, in arrival order.' },
    ],
  },

  binary_search: {
    title: 'Binary Search',
    nodes: [2, 5, 8, 12, 16, 23, 38, 45].map((v, i) => rect(`n${i}`, 25 + i * 33, 70, String(v))),
    edges: [],
    steps: [
      { activeIds: ['n0', 'n3', 'n7'], caption: 'Target 16. low=idx0(2), mid=idx3(12), high=idx7(45).' },
      { activeIds: ['n4', 'n5', 'n7'], caption: '16 > 12 — discard the left half. New low=idx4(16), mid=idx5(23).' },
      { activeIds: ['n4'], caption: '16 < 23 — discard the right half. low=mid=high=idx4.' },
      { activeIds: ['n4'], caption: 'Found — 16 at index 4, in 3 comparisons instead of checking all 8.' },
    ],
  },

  merge_sort: {
    title: 'Merge Sort',
    nodes: [
      rect('t0', 40, 30, '8'), rect('t1', 90, 30, '3'), rect('t2', 140, 30, '5'), rect('t3', 190, 30, '1'),
      rect('b0', 40, 110, '1'), rect('b1', 90, 110, '3'), rect('b2', 140, 110, '5'), rect('b3', 190, 110, '8'),
    ],
    edges: [],
    steps: [
      { visibleIds: ['t0', 't1', 't2', 't3'], caption: 'Unsorted: 8, 3, 5, 1 — split into halves, then single elements.' },
      { visibleIds: ['t0', 't1', 't2', 't3', 'b0'], activeIds: ['b0'], caption: 'Merging picks the smallest first: 1.' },
      { visibleIds: ['t0', 't1', 't2', 't3', 'b0', 'b1'], activeIds: ['b1'], caption: 'Next smallest: 3.' },
      { visibleIds: ['t0', 't1', 't2', 't3', 'b0', 'b1', 'b2'], activeIds: ['b2'], caption: 'Then 5.' },
      { visibleIds: ['t0', 't1', 't2', 't3', 'b0', 'b1', 'b2', 'b3'], activeIds: ['b3'], caption: 'Finally 8. Sorted in O(n log n).' },
    ],
  },

  trees: {
    title: 'Binary Tree — Level Order',
    nodes: [
      circle('root', 140, 30, 'A'), circle('l', 80, 75, 'B'), circle('r', 200, 75, 'C'),
      circle('ll', 50, 118, 'D'), circle('lr', 110, 118, 'E'), circle('rl', 170, 118, 'F'), circle('rr', 230, 118, 'G'),
    ],
    edges: [
      { from: 'root', to: 'l' }, { from: 'root', to: 'r' },
      { from: 'l', to: 'll' }, { from: 'l', to: 'lr' },
      { from: 'r', to: 'rl' }, { from: 'r', to: 'rr' },
    ],
    steps: [
      { activeIds: ['root'], caption: 'Level-order traversal starts at the root: A.' },
      { activeIds: ['l', 'r'], activeEdgeIds: ['root-l', 'root-r'], caption: 'Visit its children next: B, then C.' },
      { activeIds: ['ll', 'lr', 'rl', 'rr'], activeEdgeIds: ['l-ll', 'l-lr', 'r-rl', 'r-rr'], caption: 'Then all grandchildren: D, E, F, G — level by level, using a queue.' },
    ],
  },

  graphs: {
    title: 'Graph Traversal (DFS)',
    nodes: [
      circle('A', 40, 30, 'A'), circle('B', 140, 20, 'B'), circle('C', 240, 30, 'C'),
      circle('D', 90, 100, 'D'), circle('E', 190, 100, 'E'),
    ],
    edges: [
      { from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'A', to: 'D' }, { from: 'B', to: 'E' }, { from: 'D', to: 'E' },
    ],
    steps: [
      { activeIds: ['A'], caption: 'Start at A, mark it visited.' },
      { activeIds: ['A', 'B'], activeEdgeIds: ['A-B'], caption: 'Move to an unvisited neighbor: B.' },
      { activeIds: ['B', 'E'], activeEdgeIds: ['B-E'], caption: 'From B, go deeper to E (DFS goes deep before wide).' },
      { activeIds: ['E', 'D'], activeEdgeIds: ['D-E'], caption: 'From E, backtrack to D via the shared edge.' },
      { activeIds: ['B', 'C'], activeEdgeIds: ['B-C'], caption: 'Backtrack to B, visit remaining neighbor C. Done.' },
    ],
  },

  virtual_dom: {
    title: 'Virtual DOM Diffing',
    nodes: [
      rect('vRoot', 70, 25, 'div', { w: 60 }), rect('vA', 40, 70, 'p', { w: 50 }), rect('vB', 100, 70, 'span', { w: 60 }),
      rect('rRoot', 210, 25, 'div', { w: 60 }), rect('rA', 180, 70, 'p', { w: 50 }), rect('rB', 240, 70, 'span', { w: 60 }),
    ],
    edges: [{ from: 'vRoot', to: 'vA' }, { from: 'vRoot', to: 'vB' }, { from: 'rRoot', to: 'rA' }, { from: 'rRoot', to: 'rB' }],
    steps: [
      { caption: 'New virtual tree (left) is compared against the current real DOM (right).' },
      { activeIds: ['vB', 'rB'], caption: 'React finds the span text changed — everything else matches.' },
      { activeIds: ['rB'], caption: 'Only that one real DOM node gets patched — siblings are left untouched.' },
    ],
  },

  react_lifecycle: {
    title: 'React Component Lifecycle',
    nodes: [rect('n0', 50, 70, 'Mount'), rect('n1', 140, 70, 'Update'), rect('n2', 230, 70, 'Unmount')],
    edges: [{ from: 'n0', to: 'n1' }, { from: 'n1', to: 'n2' }],
    steps: [
      { activeIds: ['n0'], caption: 'Mount: constructor → render → effects run.' },
      { activeIds: ['n0', 'n1'], activeEdgeIds: ['n0-n1'], caption: 'Update: props/state change → re-render → effects re-run if dependencies changed.' },
      { activeIds: ['n1', 'n2'], activeEdgeIds: ['n1-n2'], caption: 'Unmount: cleanup functions run to avoid memory leaks.' },
    ],
  },

  promises: {
    title: 'Promise States',
    nodes: [
      rect('pending', 50, 70, 'Pending'), rect('resolved', 160, 40, 'Resolved'),
      rect('rejected', 160, 100, 'Rejected'), rect('then', 250, 40, '.then()'), rect('catch', 250, 100, '.catch()'),
    ],
    edges: [
      { from: 'pending', to: 'resolved' }, { from: 'pending', to: 'rejected' },
      { from: 'resolved', to: 'then' }, { from: 'rejected', to: 'catch' },
    ],
    steps: [
      { activeIds: ['pending'], caption: 'A promise starts pending — the async operation is running.' },
      { activeIds: ['pending', 'resolved'], activeEdgeIds: ['pending-resolved'], caption: 'On success it transitions to resolved with a value.' },
      { activeIds: ['resolved', 'then'], activeEdgeIds: ['resolved-then'], caption: '.then() runs with that value.' },
      { activeIds: ['pending', 'rejected'], activeEdgeIds: ['pending-rejected'], caption: 'If it fails instead, it transitions to rejected with an error.' },
      { activeIds: ['rejected', 'catch'], activeEdgeIds: ['rejected-catch'], caption: '.catch() handles that error.' },
    ],
  },

  closures: {
    title: 'Closures',
    nodes: [
      rect('outer', 140, 35, 'outer(): count = 0', { w: 200 }),
      rect('inner', 140, 100, 'inner(): count++', { w: 170 }),
    ],
    edges: [{ from: 'outer', to: 'inner' }],
    steps: [
      { activeIds: ['outer'], caption: 'outer() runs once and creates a variable, count.' },
      { activeIds: ['inner'], caption: 'inner() is returned — but keeps a live reference to count.' },
      { activeIds: ['outer', 'inner'], activeEdgeIds: ['outer-inner'], caption: "Even after outer() finishes, inner() still remembers count. That's a closure." },
    ],
  },

  event_loop: {
    title: 'The Event Loop',
    nodes: [rect('stack', 50, 40, 'Call Stack'), rect('webapi', 220, 40, 'Web APIs'), rect('queue', 220, 105, 'Task Queue')],
    edges: [{ from: 'stack', to: 'webapi' }, { from: 'webapi', to: 'queue' }, { from: 'queue', to: 'stack' }],
    steps: [
      { activeIds: ['stack'], caption: 'Synchronous code runs first, on the call stack.' },
      { activeIds: ['stack', 'webapi'], activeEdgeIds: ['stack-webapi'], caption: 'setTimeout/fetch hand off to Web APIs — the stack stays free.' },
      { activeIds: ['webapi', 'queue'], activeEdgeIds: ['webapi-queue'], caption: 'When it finishes, the callback moves to the task queue.' },
      { activeIds: ['queue', 'stack'], activeEdgeIds: ['queue-stack'], caption: 'The event loop pushes it onto the stack — only once the stack is empty.' },
    ],
  },

  event_bubbling: {
    title: 'Event Bubbling',
    nodes: [rect('button', 140, 110, '<button>'), rect('section', 140, 70, '<section>'), rect('div', 140, 30, '<div>')],
    edges: [{ from: 'button', to: 'section' }, { from: 'section', to: 'div' }],
    steps: [
      { activeIds: ['button'], caption: 'A click fires on the button — the innermost target.' },
      { activeIds: ['button', 'section'], activeEdgeIds: ['button-section'], caption: 'The event bubbles up to its parent, <section>.' },
      { activeIds: ['button', 'section', 'div'], activeEdgeIds: ['button-section', 'section-div'], caption: '...then up to <div>, and onward — unless stopPropagation() is called.' },
    ],
  },
};
