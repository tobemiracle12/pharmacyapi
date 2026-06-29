import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

// ─── Initialize AWS S3 Client ────────────────────────────────────────────────
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export interface UploadedFileResult {
    key: string;
    url: string;
    bucket: string;
}

/**
 * Uploads a file buffer directly to AWS S3.
 * 
 * @param buffer The file content in binary buffer format.
 * @param fileName The original file name (or desired S3 name).
 * @param mimeType The MIME type of the file (e.g. 'image/png', 'application/pdf').
 * @param folder Optional S3 subfolder name to place the file inside.
 * @returns A promise that resolves to an UploadedFileResult.
 */
export async function uploadBufferToS3(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'uploads'
): Promise<UploadedFileResult> {
    if (!BUCKET_NAME) {
        throw new Error('AWS_S3_BUCKET_NAME environment variable is not defined.');
    }

    // Generate a unique S3 key using timestamp and original name
    const cleanFileName = fileName.replace(/\s+/g, '-').toLowerCase();
    const uniqueName = `${Date.now()}-${cleanFileName}`;
    const s3Key = folder ? `${folder}/${uniqueName}` : uniqueName;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
    });

    try {
        await s3Client.send(command);
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
        return {
            key: s3Key,
            url: publicUrl,
            bucket: BUCKET_NAME,
        };
    } catch (error) {
        console.error(`❌ Failed to upload buffer to S3 (key: ${s3Key}):`, error);
        throw error;
    }
}

/**
 * Uploads a local file from the disk to AWS S3.
 * 
 * @param filePath The absolute or relative local file path.
 * @param folder Optional S3 subfolder name.
 * @returns A promise that resolves to an UploadedFileResult.
 */
export async function uploadFileToS3(
    filePath: string,
    folder: string = 'uploads'
): Promise<UploadedFileResult> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Local file not found at path: ${resolvedPath}`);
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileName = path.basename(resolvedPath);
    
    // Rudimentary MIME type resolver based on extension
    const ext = path.extname(resolvedPath).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.txt') mimeType = 'text/plain';
    else if (ext === '.json') mimeType = 'application/json';

    return uploadBufferToS3(fileBuffer, fileName, mimeType, folder);
}

/**
 * Uploads multiple file buffers to AWS S3 in parallel.
 * 
 * @param files Array of objects containing buffer, fileName, and mimeType.
 * @param folder Optional S3 subfolder name.
 * @returns A promise that resolves to an array of UploadedFileResult.
 */
export async function uploadMultipleBuffersToS3(
    files: Array<{ buffer: Buffer; fileName: string; mimeType: string }>,
    folder: string = 'uploads'
): Promise<UploadedFileResult[]> {
    const uploadPromises = files.map((file) =>
        uploadBufferToS3(file.buffer, file.fileName, file.mimeType, folder)
    );
    return Promise.all(uploadPromises);
}

/**
 * Uploads multiple local file paths to AWS S3 in parallel.
 * 
 * @param filePaths Array of local file paths.
 * @param folder Optional S3 subfolder name.
 * @returns A promise that resolves to an array of UploadedFileResult.
 */
export async function uploadMultipleFilesToS3(
    filePaths: string[],
    folder: string = 'uploads'
): Promise<UploadedFileResult[]> {
    const uploadPromises = filePaths.map((filePath) =>
        uploadFileToS3(filePath, folder)
    );
    return Promise.all(uploadPromises);
}

/**
 * Checks if a string is a base64 Data URL representation of an image.
 * If yes, uploads the decoded buffer to Amazon S3 and returns the public S3 URL.
 * If no (e.g. it is already a HTTP/HTTPS URL or a relative asset path), it returns the string unmodified.
 * 
 * @param imageStr The image string (either a base64 Data URL or an existing URL/path).
 * @param folder The S3 subfolder to place the uploaded image inside.
 * @returns The S3 public URL or the unmodified original string.
 */
export async function handleImageUploadIfBase64(
    imageStr: string,
    folder: string = 'uploads'
): Promise<string> {
    if (!imageStr || typeof imageStr !== 'string' || !imageStr.startsWith('data:')) {
        return imageStr;
    }

    const matches = imageStr.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
        return imageStr;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Resolve file extension from MIME type
    let extension = 'bin';
    if (mimeType === 'image/jpeg') extension = 'jpg';
    else if (mimeType === 'image/png') extension = 'png';
    else if (mimeType === 'image/gif') extension = 'gif';
    else if (mimeType === 'image/webp') extension = 'webp';
    else {
        const parts = mimeType.split('/');
        if (parts.length === 2) {
            extension = parts[1];
        }
    }

    const fileName = `upload.${extension}`;
    try {
        const uploadResult = await uploadBufferToS3(buffer, fileName, mimeType, folder);
        return uploadResult.url;
    } catch (error) {
        console.error('❌ Error uploading base64 image string to S3:', error);
        throw error;
    }
}
