const fs = require('fs/promises');
const path = require('path');

const INQUIRIES_PATH = path.join(__dirname, '..', 'data', 'inquiries.json');

// A simple promise-chain "mutex" so two requests arriving at the same
// instant can never read-modify-write inquiries.json at the same time
// and clobber each other's entry.
let writeQueue = Promise.resolve();

async function readInquiries() {
  try {
    const raw = await fs.readFile(INQUIRIES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // Missing or corrupted file - start fresh rather than crashing the server.
    return [];
  }
}

function appendInquiry(entry) {
  writeQueue = writeQueue.then(async () => {
    const list = await readInquiries();
    list.push(entry);
    await fs.writeFile(INQUIRIES_PATH, JSON.stringify(list, null, 2), 'utf8');
  });
  return writeQueue;
}

module.exports = { appendInquiry, readInquiries };
