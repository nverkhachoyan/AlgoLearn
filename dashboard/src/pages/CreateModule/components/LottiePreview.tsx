import { Button, Alert } from "antd";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type LottiePreviewProps = {
  lottieUrl: string;
  onRemove: () => void;
  filename: string;
};

const LottiPreview: React.FC<LottiePreviewProps> = ({
  lottieUrl,
  onRemove,
  filename,
}) => {
  return (
    <div style={{ marginBottom: "20px", textAlign: "center" }}>
      <DotLottieReact
        src={lottieUrl}
        loop
        autoplay
        style={{
          height: "300px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "16px",
        }}
      />
      <div style={{ textAlign: "center", marginBottom: 15 }}>
        <Button
          danger
          style={{ marginLeft: "10px", borderRadius: "6px" }}
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
      <Alert
        message={`Current file: ${filename}`}
        type="success"
        showIcon
        style={{ marginBottom: "16px" }}
      />
    </div>
  );
};

export default LottiPreview;
