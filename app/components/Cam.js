import React, { useState, useRef } from "react";
import axios from "axios";
import { Camera } from "react-camera-pro";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '@/firebase'; // Make sure to import your firebase config

const Cam = ({ onObjectIdentified }) => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadImageToStorage = async (imageFile) => {
    const imageRef = ref(storage, `images/${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const analyzeImage = async (base64Image, userPrompt) => {
    try {
      const response = await axios.post('/api/getImageDescription', {
        imageData: base64Image,
        userPrompt,
      });
      const identifiedObject = response.data.text;
      
      // Upload the image to Firebase Storage
      const blob = await (await fetch(base64Image)).blob();
      const imageFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const imageUrl = await uploadImageToStorage(imageFile);

      onObjectIdentified(identifiedObject, imageUrl);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  const handleTakePhoto = async () => {
    setLoading(true);
    try {
      const photoDataUrl = camera.current.takePhoto();
      setImage(photoDataUrl);

      // Convert the data URL to a Blob
      const blob = await (await fetch(photoDataUrl)).blob();
      const base64Image = await convertToBase64(blob);
      
      analyzeImage(base64Image, "Classify this image as an object, use one noun. The noun can be multi-word, but just return one noun. Do not use words 'A' and capitalize the first letter of words as if it were a proper noun.");
    } catch (error) {
      console.error("Error taking photo:", error);
    } finally {
      setLoading(false);
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
    </div>
  );
};

export { Cam };
