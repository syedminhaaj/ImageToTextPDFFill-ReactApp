import React, { useState } from "react";
import axios from "axios";
import PDFForm from "./pdffiller/PDFForm";

const App = () => {
  return (
    <div style={{ padding: "20px" }}>
      <PDFForm />
    </div>
  );
};

export default App;
