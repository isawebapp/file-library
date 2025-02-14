import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorPage from "./ErrorPage"; // ✅ Import ErrorPage

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PreviewPage = () => {
  const location = useLocation();
  const filePath = new URLSearchParams(location.search).get("filePath");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (filePath) {
      const filePreviewUrl = `${API_BASE_URL}/api/files/view?filePath=${encodeURIComponent(filePath)}`;

      fetch(filePreviewUrl)
        .then(response => {
          if (!response.ok) throw new Error("File not found");
          return response.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setFileUrl(url);
        })
        .catch(() => setError("File not found"));
    }
  }, [filePath]);

  // ✅ Function to trigger file download
  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/view?filePath=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error("File not found");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a"); // ✅ Create download link dynamically
      a.href = url;
      a.download = filePath.split("/").pop(); // ✅ Set correct filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(url); // ✅ Cleanup blob URL
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file.");
    }
  };

  if (error) {
    return <ErrorPage message={error} />; // ✅ Show error page if file doesn't exist
  }

  return (
    <div style={styles.container}>
      <h2>Preview: {filePath?.split("/").pop()}</h2>
      {fileUrl ? (
        <>
          <div style={styles.buttonContainer}>
            <button style={styles.downloadButton} onClick={handleDownload}>⬇ Download</button> {/* ✅ Click to force download */}
          </div>
          <object data={fileUrl} type="application/pdf" style={styles.pdf}>
            <p>Preview not supported. <a href={fileUrl} download>Download file</a></p>
          </object>
        </>
      ) : (
        <p>Loading file...</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
  },
  buttonContainer: {
    marginBottom: "20px",
  },
  downloadButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  pdf: {
    width: "100%",
    height: "600px",
  },
};

export default PreviewPage;
