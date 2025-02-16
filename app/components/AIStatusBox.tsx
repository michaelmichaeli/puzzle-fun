"use client";

import { LoadingSpinner } from "./LoadingSpinner";
import { Sparkles, RefreshCw } from "lucide-react";
import { AIStatusBoxProps } from "@/types/ui";
import { ButtonWithTooltip } from "./ButtonWithTooltip";

export function AIStatusBox({
  isLoading,
  error,
  aiContent,
  onRegenerate
}: AIStatusBoxProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-400 shadow-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-yellow-400 mt-1 animate-scalePulse" />
          <div className="space-y-2">
            <p className="font-comic text-blue-400">
              <span className="font-bold">AI Magic in Action! ✨</span>
              <br />
              We&apos;re using AI to analyze your image and create a perfect
              title and description.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-[200px] space-y-4 bg-white p-6 rounded-2xl shadow-md border-2 border-blue-400/10 relative">
        <div className="absolute top-4 right-4">
          <ButtonWithTooltip
            onClick={onRegenerate}
            disabled={isLoading}
            className={`p-3 rounded-full
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed 
              transition-all transform hover:scale-105 shadow-md relative overflow-hidden
              ${!isLoading ? "bg-gradient-to-br from-secondary to-accent-pink" : ""}`}
            tooltipContent="Generate new AI analysis"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </ButtonWithTooltip>
        </div>

        <div className="pt-2">
          {error ? (
            <div className="px-6 py-3 bg-red-50 text-red-600 rounded-full font-comic shadow-sm border border-red-100">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-blue-400 font-comic">
              <LoadingSpinner size="sm" />
              <span>AI is thinking...</span>
            </div>
          ) : aiContent ? (
            <div className="space-y-4">
              <p className="font-comic">
                <span className="text-blue-400 font-bold">Description: </span>
                {aiContent.description}
              </p>
              <p className="font-comic">
                <span className="text-blue-400 font-bold">Context: </span>
                {aiContent.context}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[150px] text-blue-400/70 font-comic italic">
              Waiting for AI analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
