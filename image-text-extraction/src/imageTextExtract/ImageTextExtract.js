import React, { useState } from "react";
import axios from "axios";

const ImageTextExtract = () => {
  const [imageData, setImageData] = useState(null);
  const [ocrResult, setOcrResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    setLoading(true);
    setOcrResult("");

    try {
      const apiKey = "YOUR_GOOGLE_CLOUD_VISION_API_KEY"; // Replace with your API key
      const url = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.REACT_APP_GOOGLE_API_KEY}`;

      const response = await axios.post(url, {
        requests: [
          {
            image: {
              content: imageData.split(",")[1], // Remove the "data:image/png;base64," part
            },
            features: [
              {
                type: "TEXT_DETECTION", // Use TEXT_DETECTION for OCR
                maxResults: 1,
              },
            ],
          },
        ],
      });

      const text = response.data.responses[0].textAnnotations;
      if (text && text.length > 0) {
        setOcrResult(text[0].description); // The extracted text
      } else {
        setOcrResult("No text detected");
      }
    } catch (error) {
      console.error("Error during OCR extraction", error);
      setOcrResult("Error extracting text");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Image Text Extraction Using Google Cloud Vision API</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      {imageData && (
        <img
          src={imageData}
          alt="Uploaded"
          style={{ maxWidth: "500px", margin: "20px 0" }}
        />
      )}

      <button onClick={handleExtractText} disabled={!imageData || loading}>
        {loading ? "Extracting..." : "Extract Text"}
      </button>

      <h3>Extracted Text:</h3>
      <pre>{ocrResult}</pre>
    </div>
  );
};

export default ImageTextExtract;
