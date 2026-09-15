import fs from 'fs';

// Extract HTML and script from sonic.js
const sonic = fs.readFileSync('OguriCap/sonic.js', 'utf8');
const dHtml = sonic.substring(sonic.indexOf('const DASH_HTML = `') + 19, sonic.indexOf('`\n\nconst SIG ='));
const scriptMatches = [...dHtml.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const script = scriptMatches[0][1];

// Let's create a mock browser environment
const dom = {};
const elements = {
  app: {},
  cv: {
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      arcTo: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 10 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    }),
    width: 404,
    height: 300,
  },
  rg: { textContent: '' },
  sc: { textContent: '' },
  bs: { textContent: '' },
  muteB: { addEventListener: () => {} },
  boostB: { addEventListener: () => {} },
  jumpB: { addEventListener: () => {} },
  hint: { textContent: '' },
};

global.window = {
  AudioContext: class {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.sampleRate = 44100;
      this.destination = {};
    }
    createOscillator() {
      return {
        type: '',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, value: 0 },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, value: 0 },
        connect: () => {},
      };
    }
    createBiquadFilter() {
      return {
        type: '',
        frequency: { value: 0 },
        Q: { value: 0 },
        connect: () => {},
      };
    }
    createBuffer() {
      return { getChannelData: () => new Float32Array(100) };
    }
    createBufferSource() {
      return { connect: () => {}, start: () => {}, stop: () => {} };
    }
  },
  innerWidth: 400,
  innerHeight: 600,
  requestAnimationFrame: (cb) => {
    // run one frame
    try {
      cb(16);
    } catch (e) {
      console.error('Error inside rAF frame:', e);
    }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  }
};
global.document = {
  getElementById: (id) => elements[id] || null,
  addEventListener: () => {},
};
global.localStorage = global.window.localStorage;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.innerWidth = 400;

try {
  eval(script);
  console.log('Script evaluated without throwing!');
} catch (e) {
  console.error('Eval threw error:', e);
}
