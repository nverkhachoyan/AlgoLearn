import { useEffect, useState } from "react";
import { buildImgUrl } from "../../store/utils";
import { LottieContent, Module } from "../../types/models";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LottieSection: React.FC<{
  content: LottieContent;
  module: Module | null;
}> = ({ content, module }) => {
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    if (module) {
      const builtUrl = buildImgUrl(
        "modules",
        module.folderObjectKey,
        content.objectKey,
        "lottie"
      );
      setImgUrl(builtUrl);
    } else {
      setImgUrl(content.tempUrl);
    }
  }, [module, content.mediaExt, content.objectKey, content.tempUrl]);

  return (
    <div className="markdown-content">
      <DotLottieReact
        width={content.width}
        height={content.height}
        src={imgUrl}
        loop={content.loop}
        autoplay
      />
    </div>
  );
};

export default LottieSection;
