import Image from "next/image";
import brandMark from "../../public/oppra-splash-blue-1080x1920-2 (1) 1.png";

export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <Image src={brandMark} alt="" sizes="128px" />
      </span>
      <span>oppra<span className="brand-period">.</span></span>
    </span>
  );
}
