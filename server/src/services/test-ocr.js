import { createWorker } from 'tesseract.js';

async function test() {
  console.log('Initializing Tesseract worker...');
  try {
    const worker = await createWorker('eng');
    console.log('Worker created successfully!');
    await worker.terminate();
    console.log('Worker terminated successfully!');
  } catch (err) {
    console.error('Error initializing worker:', err.message);
  }
}

test();
