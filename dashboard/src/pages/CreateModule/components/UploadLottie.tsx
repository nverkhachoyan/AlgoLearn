import React from "react";
import { FileOutlined } from "@ant-design/icons";

type UploadLottieProps = {
  isHovering: boolean;
  onButtonClick: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
};

const UploadLottie: React.FC<UploadLottieProps> = ({
  isHovering,
  onButtonClick,
  onHoverEnter,
  onHoverLeave,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload lottie animation"
      style={{
        maxWidth: 400,
        maxHeight: 200,
        border: `2px dashed ${isHovering ? "#1890ff" : "#d9d9d9"}`,
        borderRadius: "8px",
        padding: "20px 20px",
        textAlign: "center",
        cursor: "pointer",
        marginTop: "20px",
        transition: "all 0.3s",
      }}
      onClick={onButtonClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onButtonClick();
        }
      }}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <FileOutlined
        style={{ fontSize: 20, color: "#1890ff", marginBottom: 16 }}
      />
      <p>Click or drag file to this area to upload</p>
      <p style={{ color: "#888" }}>Support for .lottie animated files only</p>
    </div>
  );
};

export default UploadLottie;
