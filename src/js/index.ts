import m from 'mithril';
import {App} from './app.js';

// Use `location.hash` (i.e. #) routing convention.
m.route.prefix = '#';

// Render controls.
const el = document.getElementById('controls');
if (!el) {
  throw new Error('Cannot find `#controls` element.');
}

m.route(el, '/', {
  '/': App,
});

