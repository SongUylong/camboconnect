import B2 from 'backblaze-b2';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface B2UploadOptions {
  filePath: string;
  fileName?: string;
  contentType?: string;
  bucketId?: string;
}

// Define error interface
interface B2Error {
  message?: string;
  status?: number;
  response?: {
    status?: number;
    data?: any;
  };
}

class B2StorageService {
  private b2: any;
  private bucketId: string;
  private bucketName: string;
  private isAuthorized: boolean = false;

  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID || '',
      applicationKey: process.env.B2_APPLICATION_KEY || '',
    });
    this.bucketId = process.env.B2_BUCKET_ID || '';
    this.bucketName = process.env.B2_BUCKET_NAME || '';
    
  }

  private async authorize() {
    try {
      await this.b2.authorize();
      this.isAuthorized = true;
    } catch (error: unknown) {
      console.error('B2 Authorization Error:', error);
      throw new Error('Failed to authorize with B2. Check your credentials in .env');
    }
  }

  private getFileUrl(fileName: string): string {
    const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
    return `https://media.camboconnect.com/${normalizedFileName}`;
  }
  

  async uploadFile({ 
    filePath, 
    fileName = `${uuidv4()}-${Date.now()}`, 
    contentType = 'application/octet-stream',
    bucketId = this.bucketId
  }: B2UploadOptions): Promise<string> {
    
    if (!this.isAuthorized) {
      await this.authorize();
    }

    try {
      // Normalize the file name to handle slashes correctly
      const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      
      // Get upload URL
      const { data: { uploadUrl, authorizationToken } } = await this.b2.getUploadUrl({
        bucketId: bucketId,
      });

      // Read file
      const fileData = fs.readFileSync(filePath);
      
      
      // Upload file
      try {
        const { data } = await this.b2.uploadFile({
          uploadUrl: uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName: normalizedFileName,
          data: fileData,
          contentType: contentType,
        });

        // Return the public URL for the file
        const fileUrl = this.getFileUrl(data.fileName);
        return fileUrl;
      } catch (uploadErrorUnknown: unknown) {
        const uploadError = uploadErrorUnknown as B2Error;
        // Check if the error is related to authorization
        if (uploadError.message?.includes('unauthorized') || 
            uploadError.status === 401 || 
            uploadError.response?.status === 401) {
          // Re-authorize and try again
          await this.authorize();
          
          // Get a fresh upload URL and token
          const { data: { uploadUrl: newUrl, authorizationToken: newToken } } = await this.b2.getUploadUrl({
            bucketId: bucketId,
          });
          
          // Try upload again
          const { data } = await this.b2.uploadFile({
            uploadUrl: newUrl,
            uploadAuthToken: newToken,
            fileName: normalizedFileName,
            data: fileData,
            contentType: contentType,
          });
          
          const fileUrl = this.getFileUrl(data.fileName);
          return fileUrl;
        } else {
          // If not an authorization error, rethrow
          throw uploadErrorUnknown;
        }
      }
    } catch (errorUnknown: unknown) {
      const error = errorUnknown as B2Error;
      console.error('B2 Upload Error:', errorUnknown);
      if (error.message) {
        console.error('Error details:', error.message);
      }
      if (error.response?.data) {
        console.error('B2 API Response:', error.response.data);
      }
      throw new Error(`Failed to upload file to B2: ${error.message || 'Unknown error'}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (!this.isAuthorized) {
      await this.authorize();
    }

    try {
      
      // Normalize the fileName to prevent issues with slashes
      const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      
      // Find the file version first
      const { data: { files } } = await this.b2.listFileNames({
        bucketId: this.bucketId,
        prefix: normalizedFileName,
        maxFileCount: 1,
      });

      if (files.length === 0) {
        throw new Error('File not found');
      }

      // Delete the file
      await this.b2.deleteFileVersion({
        fileName: files[0].fileName,
        fileId: files[0].fileId,
      });
      
    } catch (errorUnknown: unknown) {
      const error = errorUnknown as B2Error;
      console.error('B2 Delete Error:', errorUnknown);
      if (error.message) {
        console.error('Error details:', error.message);
      }
      if (error.response?.data) {
        console.error('B2 API Response:', error.response.data);
      }
      throw new Error(`Failed to delete file from B2: ${error.message || 'Unknown error'}`);
    }
  }
}

export default new B2StorageService();