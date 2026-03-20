
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import path from 'path';

// Load service account from firebase-mcp-server location if possible, 
// but usually we can use ADC if logged in.
// Since I'm an agent with terminal access, I'll use the environment.

const project = 'soulthread-15a72';

initializeApp({
  projectId: project
});

const db = getFirestore();

async function main() {
  const categories = await db.collection('categories').get();
  categories.forEach(doc => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
  });
}

main().catch(console.error);
