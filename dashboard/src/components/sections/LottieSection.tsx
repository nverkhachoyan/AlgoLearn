import { LottieContent } from "../../types/models";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LottieSection: React.FC<{ content: LottieContent }> = ({}) => (
  <div className="markdown-content">
    <DotLottieReact src="/anim.lottie" loop autoplay />
  </div>
);

export default LottieSection;
