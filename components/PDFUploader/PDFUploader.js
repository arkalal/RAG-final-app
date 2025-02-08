import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page } from "react-pdf";
import toast from "react-hot-toast";
import styles from "./PDFUploader.module.scss";

const PDFUploader = ({ onUploadSuccess }) => {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onUploadSuccess(file, data.namespace);
        toast.success("PDF uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload PDF");
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <div className={styles.uploader}>
      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the PDF here...</p>
        ) : (
          <p>Drag & drop a PDF here, or click to select</p>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
