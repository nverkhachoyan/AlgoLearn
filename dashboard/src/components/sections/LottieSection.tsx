import { buildImgUrl } from "../../store/utils";
import { LottieContent, Module } from "../../types/models";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LottieSection: React.FC<{ content: LottieContent; module: Module }> = ({
  content,
  module,
}) => {
  const sourceUrl = buildImgUrl(
    "modules",
    module.folderObjectKey,
    content.objectKey,
    "lottie"
  );
  console.log("POR QUE", module.folderObjectKey, content.objectKey, "lottie");
  console.log("SRC URL", sourceUrl);
  return (
    <div className="markdown-content">
      <DotLottieReact
        width={content.width}
        height={content.height}
        src={sourceUrl}
        loop={content.loop}
        autoplay
      />
    </div>
  );
};

export default LottieSection;
