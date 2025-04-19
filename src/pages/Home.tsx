import { useState } from "react";
import privacyJson from "../privacy.json";
import "../styles/home.css";

const Home = () => {
  const [agreed, setAgreed] = useState(false);
  const [predictedImageUrl, setPredictedImageUrl] = useState<string | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const privacyData = privacyJson;

  type PrivacySection = {
    title: string;
    content: string;
  };

  // predict
  const analyzeImage = async (imageFile: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await fetch(
        `http://jmradai.pythonanywhere.com/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setPredictedImageUrl(imageUrl);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        minHeight: "100vh",
        padding: isMobile ? "8px" : "40px",
        borderRadius: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "12px" : "40px",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
            padding: isMobile ? "16px" : "40px",
            borderRadius: "24px",
            marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h1
            style={{
              background: "linear-gradient(135deg, #4f9eff 0%, #2d7bff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "48px",
              fontWeight: "800",
              // marginBottom: "16px",
              textAlign: "center",
            }}
          >
            RadAI: Kidney Stone Detection 🩺
          </h1>
          <p
            style={{
              fontSize: "18px",
              marginTop: "16px",
              lineHeight: "1.6",
              color: "#e0e0e0",
              textAlign: "center",
              maxWidth: "100%",
              margin: "0 auto",
            }}
          >
            <strong style={{ color: "#4f9eff" }}>RadAI</strong> is an AI-powered
            binary classification tool designed to assist in detecting kidney
            stones in ultrasound images. The model classifies images into two
            categories: Kidney Stone Detected or Normal Kidney. Simply upload or
            capture an image, and RadAI will process it and provide real-time
            results based on the analysis.
          </p>
        </div>

        {/* Privacy Policy Section */}
        <details
          style={{
            marginBottom: "24px",
            background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
            padding: "12px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "300",
              color: "#ffffff",
              userSelect: "none",
              fontSize: "18px",
              marginBottom: "16px",
            }}
          >
            View Privacy Policy Details
          </summary>
          <div style={{ marginTop: "24px", color: "#e0e0e0" }}>
            {privacyData.privacy_policy.sections.map((section, index) => (
              <div key={index} style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    color: "#4f9eff",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {section.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#e0e0e0",
                    margin: "0",
                  }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </details>

        {/* Privacy Policy Checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            padding: "16px",
            background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
            borderRadius: "12px",
            cursor: "pointer",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              accentColor: "#4f9eff",
            }}
          />
          <span style={{ color: "#e0e0e0" }}>
            I agree to the Privacy Policy
          </span>
        </label>

        {/* Upload Section */}
        {agreed && (
          <div
            style={{
              background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
              padding: "32px",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3
              style={{
                fontWeight: "300",
                marginBottom: "24px",
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              Upload Ultrasound Image
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <label
                style={{
                  display: "inline-block",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      analyzeImage(file);
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background:
                      "linear-gradient(135deg, #4f9eff 0%, #2d7bff 100%)",
                    padding: "16px 32px",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 16px rgba(79, 158, 255, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(79, 158, 255, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(79, 158, 255, 0.3)";
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Ultrasound Image
                </div>
              </label>
            </div>

            {isAnalyzing && (
              <div style={{ textAlign: "center", color: "#e0e0e0" }}>
                <div className="loader" style={{ marginBottom: "16px" }}></div>
              </div>
            )}

            {predictedImageUrl && !isAnalyzing && (
              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <h2 style={{ color: "#e0e0e0" }}>Yolov8m Prediction</h2>

                <img
                  src={predictedImageUrl}
                  alt="Predicted"
                  style={{
                    maxWidth: "600px",
                    width: "100%",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  }}
                />
                <a
                  href={predictedImageUrl}
                  download="predicted-image.jpg"
                  style={{
                    background:
                      "linear-gradient(135deg, #4f9eff 0%, #2d7bff 100%)",
                    color: "white",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: "600",
                    transition: "transform 0.2s ease",
                    boxShadow: "0 4px 16px rgba(79, 158, 255, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Download Result
                </a>

                <p
                  style={{
                    marginBottom: "0",
                    textAlign: "center",
                    color: "#e0e0e0",
                  }}
                >
                  Please answer the{""}
                  <a
                    href="https://forms.gle/XcHB2Y57JT7FWFPSA"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background:
                        "linear-gradient(135deg, #4f9eff 0%, #2d7bff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textDecoration: "none",
                      fontWeight: "600",
                      padding: "0 4px",
                    }}
                  >
                    User Acceptance Testing (UAT)
                  </a>
                  {""}
                  survey.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
