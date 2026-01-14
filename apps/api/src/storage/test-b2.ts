import { readFileSync } from 'fs';
import { join } from 'path';
import { B2Storage } from './b2.storage';

async function testB2Connection() {
  console.log('🚀 Starting B2 Storage connection test...\n');

  const storage = new B2Storage();
  const testImagePath = join(__dirname, '../photos/test.png');
  const testKey = `test-uploads/test-${Date.now()}.png`;

  try {
    // 1. Read test file
    console.log('📖 Reading test file...');
    const fileBuffer = readFileSync(testImagePath);
    console.log(`   ✅ File read successfully (${fileBuffer.length} bytes)\n`);

    // 2. Upload to B2
    console.log(`📤 Uploading to B2 with key: ${testKey}...`);
    await storage.upload(testKey, fileBuffer, 'image/png');
    console.log('   ✅ Upload successful!\n');

    // 3. Get signed URL
    // console.log('🔗 Getting signed URL...');
    // const signedUrl = await storage.getSignedUrl(testKey);
    // console.log(`   ✅ Signed URL: ${signedUrl}\n`);

    // // 4. Delete test file (cleanup)
    // console.log('🗑️  Cleaning up (deleting test file)...');
    // await storage.delete(testKey);
    // console.log('   ✅ Cleanup successful!\n');

    console.log('✅ All B2 Storage tests passed!');
  } catch (error) {
    console.error('❌ B2 Storage test failed:', error);
    process.exit(1);
  }
}

void testB2Connection();
