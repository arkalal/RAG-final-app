"use client";

import React, { useState } from "react";
import PDFUploader from "../PDFUploader/PDFUploader";
import Chat from "../Chat/Chat";
import toast from "react-hot-toast";
import styles from "./Home.module.scss";

const Home = () => {
  const [currentFile, setCurrentFile] = useState(null);
  const [namespace, setNamespace] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleUploadSuccess = async (file, ns) => {
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

      const data = await response.json();
      if (data.message === "Data cleared successfully") {
        toast.success("Data cleared successfully");
        setCurrentFile(null);
        setNamespace(null);
        setPdfUrl(null);
      } else {
        throw new Error(data.error || "Failed to clear data");
      }
    } catch (error) {
      console.error("Clear data error:", error);
      toast.error("Failed to clear data");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setIsUploading(true);
      setCurrentFile(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const objectUrl = URL.createObjectURL(file);
          setPdfUrl(objectUrl);
          setNamespace(file.name);
          toast.success("PDF uploaded successfully!");
        } else {
          toast.error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Error uploading file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className={styles.home}>
      <div className={styles.pdfSection}>
        <div className={styles.pdfContainer}>
          {isUploading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner}></div>
              <p>Uploading PDF...</p>
            </div>
          ) : pdfUrl ? (
            <embed
              src={pdfUrl}
              type="application/pdf"
              className={styles.pdfEmbed}
            />
          ) : (
            <div className={styles.uploadPrompt}>
              <p>Upload a PDF to see preview</p>
            </div>
          )}
        </div>
        <div className={styles.controls}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className={styles.fileInput}
          />
          {currentFile && (
            <button onClick={handleClearData} className={styles.clearButton}>
              Clear Data
            </button>
          )}
        </div>
      </div>
      <div className={styles.chatSection}>
        <Chat namespace={namespace} />
      </div>
    </div>
  );
};

export default Home;
