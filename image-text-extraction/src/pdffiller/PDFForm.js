import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { last, PDFDocument } from "pdf-lib";

const PDFForm = () => {
  const [imageData, setImageData] = useState(null);
  const [ocrResult, setOcrResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [filledPdf, setFilledPdf] = useState(null);

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

  const extractName = (text) => {
    //const regex = /Canada([\s\S]*?)8/; // Matches between "Canada" and "8"
    // const regex = /1,2\s+(.+)/;
    //const regex = /(?<=1,2\s+NAME\/NOM\s+ON\s+CANADA)(.*)/s; // only name after
    const regex = /(?<=1,2\s+NAME\/NOM\s+ON\s+CANADA)(.*?)(?=\s*8)/s;

    const match = text.match(regex);

    if (match) {
      return match[1].trim(); // Return the extracted text trimmed of extra spaces
    }

    return null;
  };

  const handleExtractText = async () => {
    setLoading(true);
    setOcrResult("");

    try {
      const apiKey = "YOUR_GOOGLE_CLOUD_VISION_API_KEY"; // Replace with your API key
      const url = `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCCSTPYF3rH8z-02QaJjfih--9IXGuoL-Y`;

      const response = await axios.post(url, {
        requests: [
          {
            image: {
              content: imageData.split(",")[1], // Remove the "data:image/png;base64," part
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      });

      const text = response.data.responses[0].textAnnotations;
      if (text && text.length > 0) {
        const extractedText = text[0].description;
        setOcrResult(extractedText);
        console.log("extractedText", extractedText);
        const name = extractName(extractedText);
        //write here
        console.log("ame", name);

        const nameParts = name.split(",");
        console.log("nameParts", nameParts);
        const finalNameObj = {
          firstName: nameParts[0].trim(),
          lastName: nameParts[1],
        };
        console.log("finalNameObj", finalNameObj);

        const lastName = nameParts[1] ? nameParts[1].split(" ")[0].trim() : ""; // Get text before space after comma

        if (finalNameObj) {
          await fillPdfForm(finalNameObj);
        } else {
          setOcrResult("Name not detected in the image");
        }
      } else {
        setOcrResult("No text detected");
      }
    } catch (error) {
      console.error("Error during OCR extraction", error);
      setOcrResult("Error extracting text");
    }

    setLoading(false);
  };

  const fillPdfForm = async ({ firstName, lastName }) => {
    try {
      const formPdfUrl = "/assets/emptyForm.pdf"; // Replace with the actual PDF form URL
      const formPdfBytes = await fetch(formPdfUrl).then((res) =>
        res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(formPdfBytes);
      console.log("pdfDoc", pdfDoc);
      const form = pdfDoc.getForm();
      form.getFields().forEach((field) => {
        console.log("****** wat is is this ", field.getName());
      });
      const firstNameField = form.getTextField("Name");
      const lastNameField = form.getTextField("Address");
      console.log(
        "firstname and lastname inside function**********&&&&",
        firstName,
        lastName
      );
      firstNameField.setText(firstName);
      lastNameField.setText(lastName);

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      setFilledPdf(URL.createObjectURL(pdfBlob));
    } catch (error) {
      console.error("Error filling PDF form", error);
    }
  };

  const downloadPdf = () => {
    if (filledPdf) {
      saveAs(filledPdf, "filled-form.pdf");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Image to PDF Form Filler</h1>

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
        {loading ? "Processing..." : "Extract and Fill PDF"}
      </button>

      <h3>OCR Result:</h3>
      <pre>{ocrResult}</pre>

      {filledPdf && (
        <div>
          <h3>Filled PDF:</h3>
          <a href={filledPdf} target="_blank" rel="noopener noreferrer">
            View Filled PDF
          </a>
          <button onClick={downloadPdf}>Download PDF</button>
        </div>
      )}
    </div>
  );
};

export default PDFForm;
