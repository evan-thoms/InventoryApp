// pages/api/getImageDescription.js

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { VertexAI } from '@google-cloud/vertexai';

// VERTEX/GEMINI CONFIGURATION -- CHANGE THIS TO YOUR PROJECT
const projectLocation = "us-central1";
const projectId = "hspantry-f443d";
const model = "gemini-pro-vision"; // vision required for images/videos

// Convert image URL to base64 string
const getImageAsBase64FromURL = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    return buffer.toString("base64");
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image');
  }
};

// Get the MIME file type required by Gemini when passing files
const getMimeType = (url) => {
  const extensionToMimeType = {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    mov: "video/mov",
    mpeg: "video/mpeg",
    mp4: "video/mp4",
    mpg: "video/mpg",
    avi: "video/avi",
    wmv: "video/wmv",
    mpegps: "video/mpegps",
    flv: "video/flv",
  };

  const extension = url.split(".").pop().toLowerCase();
  return extensionToMimeType[extension] || null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, userPrompt } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const vertexAI = new VertexAI({
    project: projectId,
    location: projectLocation,
  });

  const generativeVisionModel = vertexAI.preview.getGenerativeModel({
    model: model,
  });

  const textPart = { text: userPrompt };
  let requestPart = [textPart];

  try {
    console.log('Fetching image as base64...');
    const base64File = await getImageAsBase64FromURL(imageUrl);
    const mimeType = getMimeType(imageUrl);

    if (!mimeType) {
      console.error('Unsupported file type');
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const filePart = {
      inlineData: {
        data: base64File,
        mimeType: mimeType,
      },
    };

    requestPart.push(filePart);

    const request = {
      contents: [{ role: "user", parts: requestPart }],
    };

    console.log('Sending request to Gemini Vision Pro...');
    const responseStream = await generativeVisionModel.generateContentStream(request);
    const aggregatedResponse = await responseStream.response;

    console.log('Received response from Gemini Vision Pro');
    return res.status(200).json({ text: aggregatedResponse.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error('Error processing the image:', error);
    return res.status(500).json({ error: 'Error processing the image' });
  }
}
