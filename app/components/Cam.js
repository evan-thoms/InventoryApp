import React, { useState, useRef } from "react";
import axios from "axios";
import { Camera } from "react-camera-pro";

const Cam = () => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [identifiedObject, setIdentifiedObject] = useState("");
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const analyzeImage = async (base64Image, userPrompt) => {
    console.log(base64Image, " WE GOT THIS");
    try {
      const response = await axios.post('/api/getImageDescription', {
        imageData: base64Image,
        userPrompt,
      });
      setIdentifiedObject(response.data.text);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  const handleTakePhoto = () => {
    try {
      const photoDataUrl = camera.current.takePhoto();
      setImage(photoDataUrl);

      // Convert the data URL to a Blob
      fetch(photoDataUrl)
        .then(res => res.blob())
        .then(blob => convertToBase64(blob))
        .then(base64Image => analyzeImage(base64Image, "Describe this image"))
        .catch(err => console.error("Error processing photo data:", err));
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '80px', border: '1px solid #333' }}>
          <div style={{ textAlign: 'center' }}>Position Your Item Here</div>
          <div style={{ width: '400px', height: '300px', overflow: 'hidden', position: 'relative' }}>
            <Camera ref={camera} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
        <button style={{ height: '50px' }} onClick={handleTakePhoto} disabled={loading}>
          {loading ? 'Uploading...' : 'Take Photo'}
        </button>
      </div>

      {image && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', flexDirection: "column" }}>
          <div style={{ textAlign: 'center' }}>Your Photo</div>
          <img src={image} alt='Taken photo' style={{ width: '400px', height: 'auto' }} />
        </div>
      )}

      {identifiedObject && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h3>Identified Object:</h3>
          <p>{identifiedObject}</p>
        </div>
      )}
    </div>
  );
};

export { Cam };
