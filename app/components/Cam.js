import React, { useState, useRef } from "react";
import axios from "axios";
import { Camera } from "react-camera-pro";
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Cam = () => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [identifiedObject, setIdentifiedObject] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeImage = async (imageUrl, userPrompt) => {
    imageUrl="https://www.shutterstock.com/image-photo/chili-pepper-isolated-on-white-260nw-1524467540.jpg"
    console.log(imageUrl, " WE GOT THIS");
    try {
      const response = await axios.post('/api/getImageDescription', {
        imageUrl,
        userPrompt,
      });
      setIdentifiedObject(response.data.text);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  const uploadImage = async (imageBlob) => {
    setLoading(true);
    const imageRef = ref(storage, `images/${Date.now()}.jpg`);

    try {
      const snapshot = await uploadBytes(imageRef, imageBlob);
      const imageURL = await getDownloadURL(snapshot.ref);
      console.log("Image uploaded and URL obtained:", imageURL);

      // Analyze the uploaded image
      await analyzeImage(imageURL, "Describe this image");

      // Optional: Clear image after analysis
      setImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = () => {
    try {
      const photoDataUrl = camera.current.takePhoto();
      setImage(photoDataUrl);

      // Convert the data URL to a Blob
      fetch(photoDataUrl)
        .then(res => res.blob())
        .then(uploadImage)
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
