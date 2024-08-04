const {
    FunctionDeclarationSchemaType,
    HarmBlockThreshold,
    HarmCategory,
    VertexAI
  } = require('@google-cloud/vertexai');
  
  const project = 'hspantry-f443d';
  const location = 'us-central1';
  const textModel =  'gemini-1.0-pro';
  const visionModel = 'gemini-1.0-pro-vision';
  
  const vertexAI = new VertexAI({project: project, location: location});
  
  // Instantiate Gemini models
  const generativeModel = vertexAI.getGenerativeModel({
      model: textModel,
    });
  
  const generativeVisionModel = vertexAI.getGenerativeModel({
      model: visionModel,
  });
  
  const generativeModelPreview = vertexAI.preview.getGenerativeModel({
      model: textModel,
  });
  
  async function generateContent() {
    const request = {
      contents: [{role: 'user', parts: [{text: 'How are you doing today?'}]}],
    };
    const result = await generativeModel.generateContent(request);
    const response = result.response;
    console.log('Response: ', JSON.stringify(response));
  };
  
  export {generateContent}