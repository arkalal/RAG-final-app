"use client";

import React, { useState } from "react";
import PDFUploader from "../PDFUploader/PDFUploader";
import Chat from "../Chat/Chat";
import toast from "react-hot-toast";
import styles from "./Home.module.scss";

const Home = () => {
  const [currentFile, setCurrentFile] = useState(null);
  const [namespace, setNamespace] = useState(null);

  const handleUploadSuccess = (file, ns) => {
    setCurrentFile(file);
    setNamespace(ns);
  };

  const handleClearData = async () => {
    try {
      const response = await fetch("/api/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace }),
      });

      if (!response.ok) throw new Error("Failed to clear data");

      toast.success("Data cleared successfully");
      setCurrentFile(null);
      setNamespace(null);
    } catch (error) {
      console.error("Clear data error:", error);
      toast.error("Failed to clear data");
    }
  };

  return (
    <div className={styles.home}>
      <div className={styles.pdfSection}>
        <PDFUploader onUploadSuccess={handleUploadSuccess} />
        {currentFile && (
          <div className={styles.pdfPreview}>
            <h3>{currentFile.name}</h3>
            <button onClick={handleClearData} className={styles.clearButton}>
              Clear Data
            </button>
          </div>
        )}
      </div>
      <div className={styles.chatSection}>
        <Chat namespace={namespace} />
      </div>
    </div>
  );
};

export default Home;
