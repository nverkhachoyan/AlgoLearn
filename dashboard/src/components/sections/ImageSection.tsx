import { ImageContent, Module } from "../../types/models";
import { Image } from "antd";
import { buildImgUrl } from "../../store/utils";
import Title from "antd/es/typography/Title";

const ImageSection: React.FC<{ content: ImageContent; module: Module }> = ({
  content,
  module,
}) => {
  const imgUrl = buildImgUrl(
    "modules",
    module.folderObjectKey,
    content.objectKey,
    content.mediaExt
  );
  return (
    <div className="markdown-content">
      <Title>{content.headline}</Title>
      <Image
        src={imgUrl}
        alt={content.altText}
        width={content.width}
        height={content.height}
      />
      <Title>{content.caption}</Title>
    </div>
  );
};

export default ImageSection;
