import { NextApiRequest, NextApiResponse } from 'next';
import { VertexAI } from '@google-cloud/vertexai';

// VERTEX/GEMINI CONFIGURATION -- CHANGE THIS TO YOUR PROJECT
const projectLocation = "us-central1";
const projectId = "hspantry-f443d";
const model = "gemini-pro-vision"; // vision required for images/videos

// Get the MIME file type required by Gemini when passing files
const getMimeTypeFromBase64 = (base64String) => {
  const mimeTypeMatch = base64String.match(/^data:(.+);base64,/);
  return mimeTypeMatch ? mimeTypeMatch[1] : null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData, userPrompt } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: 'Image data is required' });
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
    const mimeType = getMimeTypeFromBase64(imageData);

    if (!mimeType) {
      console.error('Unsupported file type');
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const filePart = {
      inlineData: {
        data: imageData.split(',')[1], // Remove the base64 header
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
