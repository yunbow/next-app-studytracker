"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

type Props = {
  content: string;
  className?: string;
};

export function MarkdownPreviewComponent({ content, className }: Props) {
  const { theme } = useTheme();

  return (
    <div className={className}>
      <MarkdownPreview
        source={content}
        style={{
          backgroundColor: "transparent",
          color: "inherit",
          fontFamily: "inherit",
        }}
        wrapperElement={{
          "data-color-mode": theme === "dark" ? "dark" : "light",
        }}
      />
    </div>
  );
}
