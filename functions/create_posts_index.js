'use strict';
/**
 * Create Firestore composite index for posts collection:
 * authorId ASC + createdAt DESC
 * 
 * Run: node functions/create_posts_index.js
 */
const { execSync } = require('child_process');

// Use Firebase CLI to create the index
const indexConfig = {
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "circleId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
};

const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'firestore.indexes.json');
fs.writeFileSync(outPath, JSON.stringify(indexConfig, null, 2));
console.log('✅ Wrote firestore.indexes.json');
console.log('📋 Deploying indexes...');

try {
  execSync('firebase deploy --only firestore:indexes', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('🎉 Indexes deployed!');
} catch (e) {
  console.error('❌ Deploy failed:', e.message);
  process.exit(1);
}
