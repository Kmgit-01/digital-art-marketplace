const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const originalContainer = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_ORIGINAL);
const previewContainer = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_PREVIEW);

async function uploadFile(containerClient, fileName, buffer, contentType) {
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  return blockBlobClient.url;
}

async function uploadOriginalArt(fileName, buffer, contentType) {
  return uploadFile(originalContainer, fileName, buffer, contentType);
}

async function uploadPreviewArt(fileName, buffer, contentType) {
  return uploadFile(previewContainer, fileName, buffer, contentType);
}

module.exports = { uploadOriginalArt, uploadPreviewArt };
