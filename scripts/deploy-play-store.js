import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const KEY_FILE = path.resolve('google-play-key.json');
const PACKAGE_NAME = 'in.soulthread.app';
const BUNDLE_PATH = path.resolve('android/app/build/outputs/bundle/release/app-release.aab');

async function deploy() {
  if (!fs.existsSync(KEY_FILE)) {
    console.error('Error: google-play-key.json not found in root directory.');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const publisher = google.androidpublisher({
    version: 'v3',
    auth: auth,
  });

  console.log('🚀 Starting Play Store deployment...');

  try {
    // 1. Create a new edit
    const edit = await publisher.edits.insert({
      packageName: PACKAGE_NAME,
    });
    const editId = edit.data.id;
    console.log(`✅ Created Edit ID: ${editId}`);

    // 2. Upload the bundle
    console.log('📤 Uploading AAB bundle...');
    const res = await publisher.edits.bundles.upload({
      editId: editId,
      packageName: PACKAGE_NAME,
      media: {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(BUNDLE_PATH),
      },
    });
    const versionCode = res.data.versionCode;
    console.log(`✅ Uploaded Version Code: ${versionCode}`);

    // 3. Assign to track
    console.log('🎯 Assigning to Internal track...');
    await publisher.edits.tracks.update({
      editId: editId,
      packageName: PACKAGE_NAME,
      track: 'internal',
      requestBody: {
        releases: [
          {
            versionCodes: [versionCode.toString()],
            status: 'completed',
            releaseNotes: [
              {
                language: 'en-US',
                text: 'Production-ready build for SoulThread internal testing.',
              },
            ],
          },
        ],
      },
    });

    // 4. Commit the edit
    console.log('💾 Committing changes...');
    await publisher.edits.commit({
      editId: editId,
      packageName: PACKAGE_NAME,
    });

    console.log('✨ DEPLOYMENT SUCCESSFUL! The release is now live on the Internal track.');
  } catch (error) {
    console.error('❌ Deployment failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

deploy();
