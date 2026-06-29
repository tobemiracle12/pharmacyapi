import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { uploadFileToS3, uploadBufferToS3 } from './utils/s3';

async function runTest() {
    console.log('🧪 Starting AWS S3 Upload Helper Test...\n');
    console.log('Configured Environment:');
    console.log(`- Region: ${process.env.AWS_REGION}`);
    console.log(`- Bucket Name: ${process.env.AWS_S3_BUCKET_NAME}`);
    console.log(`- Access Key Prefix: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 5)}...`);

    const tempDir = path.resolve(__dirname, '../temp_test');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    
    const localFilePath = path.join(tempDir, 'test-s3-file.txt');
    fs.writeFileSync(localFilePath, 'Hello from the Medilazar AWS S3 reusable helper verification test!');

    try {
        console.log('\n1. Testing uploadFileToS3 (Local file upload)...');
        const fileResult = await uploadFileToS3(localFilePath, 'tests');
        console.log('✅ Upload Successful!');
        console.log(`- S3 Key: ${fileResult.key}`);
        console.log(`- S3 URL: ${fileResult.url}`);
        console.log(`- S3 Bucket: ${fileResult.bucket}`);

        console.log('\n2. Testing uploadBufferToS3 (Buffer direct upload)...');
        const buffer = Buffer.from('This is a buffer direct upload test.', 'utf-8');
        const bufferResult = await uploadBufferToS3(buffer, 'test-s3-buffer.txt', 'text/plain', 'tests');
        console.log('✅ Upload Successful!');
        console.log(`- S3 Key: ${bufferResult.key}`);
        console.log(`- S3 URL: ${bufferResult.url}`);
        console.log(`- S3 Bucket: ${bufferResult.bucket}`);

        console.log('\n✨ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ S3 Helper Test failed with error:', error);
    } finally {
        // Cleanup local temp file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir);
        }
    }
}

runTest();
