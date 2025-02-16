import { FC, ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  side = "top",
  align = "center"
}) => {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          className="z-[100] bg-white px-3 py-2 rounded-lg shadow-lg text-sm text-gray-800 select-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          sideOffset={5}
          collisionPadding={10}
          arrowPadding={5}
        >
          {content}
          <RadixTooltip.Arrow className="fill-white" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};

export default Tooltip;
