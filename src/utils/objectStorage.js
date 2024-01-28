import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { readFile } from "fs/promises";
import fs from "fs/promises";
import { getFileName } from "./getFilename.js";

export const uploadToSpaces = async (localFilePath, fileType, ACL) => {
    try {
        let spaceName = process.env.SPACES_NAME;

        if (!localFilePath) return null;

        // Read the file content asynchronously
        const fileContent = await readFile(localFilePath);

        // Extract filename from the path
        const filename =
            Date.now() + "-" + localFilePath.slice(12)?.replace(/ /g, "-");
        // const modifiedFilename = filename.replace(/ /g, '-');
        // Initialize S3Client
        const s3Client = new S3Client({
            endpoint: process.env.DO_SPACES_ENDPOINTS,
            forcePathStyle: false,
            region: process.env.SPACES_REGION,
            credentials: {
                accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
                secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
            },
        });

        const params = {
            Bucket: spaceName,
            Key: `${fileType}/${filename}`,
            Body: fileContent,
            ContentType: fileType,
            ACL: ACL,
        };

        // Upload the file
        await s3Client.send(new PutObjectCommand(params));

        // Construct the URL
        const imageURL = `https://nyc3.digitaloceanspaces.com/${spaceName}/${fileType}/${filename}`;

        console.log(`imageURL: `, imageURL);

        // Remove the local file
        await fs.unlink(localFilePath);

        return { url: imageURL };
    } catch (error) {
        console.error("Error uploading to Spaces:", error);

        // Remove the local file in case of an error
        await fs.unlink(localFilePath);

        return null;
    }
};

export const deleteFromSpaces = async (URL) => {
    try {
        const key = getFileName(URL);
        console.log(key);
        let spaceName = process.env.SPACES_NAME;

        // Initialize S3Client
        const s3Client = new S3Client({
            endpoint: process.env.DO_SPACES_ENDPOINTS,
            forcePathStyle: false,
            region: process.env.SPACES_REGION,
            credentials: {
                accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
                secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
            },
        });

        const params = {
            Bucket: spaceName,
            Key: key,
        };

        // Delete the file
        await s3Client.send(new DeleteObjectCommand(params));

        return { success: true };
    } catch (error) {
        console.error("Error deleting from Spaces:", error);
        return { success: false };
    }
};
