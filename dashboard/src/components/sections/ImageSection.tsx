import { ImageContent, Module } from "../../types/models";
import { Image } from "antd";
import { buildImgUrl } from "../../store/utils";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";

const ImageSection: React.FC<{
  content: ImageContent;
  module: Module | null;
}> = ({ content, module }) => {
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    if (module) {
      const builtImg = buildImgUrl(
        "modules",
        module.folderObjectKey,
        content.objectKey,
        content.mediaExt
      );
      setImgUrl(builtImg);
    } else {
      setImgUrl(content.url);
    }
  }, [module, content.mediaExt, content.objectKey, content.url]);

  return (
    <div className="markdown-content">
      <Title>{content.headline}</Title>
      <Image
        src={imgUrl}
        alt={content.altText}
        width={content.width > 0 ? content.width : 200}
        height={content.height > 0 ? content.height : 200}
      />
      <Title>{content.caption}</Title>
    </div>
  );
};

export default ImageSection;
