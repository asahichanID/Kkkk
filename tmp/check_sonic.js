import fs from 'fs';
const sonic = fs.readFileSync('OguriCap/sonic.js', 'utf8');
const dHtml = sonic.substring(sonic.indexOf('const DASH_HTML = `') + 19, sonic.indexOf('`\n\nconst SIG ='));
const scriptMatches = [...dHtml.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches[0][1];

// Search for addEventListener or onclick or ontouch
const lines = code.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('addEventListener') || l.includes('onclick') || l.includes('ontouch') || l.includes('pointer')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});
