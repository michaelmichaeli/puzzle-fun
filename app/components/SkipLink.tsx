import { FC } from "react";

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export const SkipLink: FC<SkipLinkProps> = ({
  targetId,
  label = "Skip to main content",
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="absolute -top-10 left-4 z-50 bg-white px-4 py-2 rounded-b-lg shadow-lg focus:top-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {label}
    </a>
  );
};

export default SkipLink;
