import { FC, ReactNode } from "react";
import { Tooltip } from "./Tooltip";

interface ButtonWithTooltipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tooltipContent: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export const ButtonWithTooltip: FC<ButtonWithTooltipProps> = ({
  children,
  tooltipContent,
  side = "top",
  align = "center",
  className = "",
  ...buttonProps
}) => {
  return (
    <Tooltip content={tooltipContent} side={side} align={align}>
      <button className={className} {...buttonProps}>
        {children}
      </button>
    </Tooltip>
  );
};

export default ButtonWithTooltip;
