"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

const LowPriority = 1;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);

  // State with full required TextFormatType keys
  const [formats, setFormats] = useState<Record<TextFormatType, boolean>>({
    bold: false,
    code: false,
    highlight: false,
    italic: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    underline: false,
    uppercase: false,
    lowercase: false,
    capitalize: false,
  });

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFormats({
        bold: selection.hasFormat("bold"),
        code: selection.hasFormat("code"),
        highlight: selection.hasFormat("highlight"),
        italic: selection.hasFormat("italic"),
        strikethrough: selection.hasFormat("strikethrough"),
        subscript: selection.hasFormat("subscript"),
        superscript: selection.hasFormat("superscript"),
        underline: selection.hasFormat("underline"),
        uppercase: selection.hasFormat("uppercase"),
        lowercase: selection.hasFormat("lowercase"),
        capitalize: selection.hasFormat("capitalize"),
      });
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  const renderButton = (
    label: string,
    command: typeof FORMAT_TEXT_COMMAND | typeof FORMAT_ELEMENT_COMMAND,
    format: TextFormatType | "left" | "center" | "right" | "justify",
    active?: boolean
  ) => (
    <button
      key={label}
      onClick={() => editor.dispatchCommand(command, format)}
      className={`px-2 py-1 rounded border ${
        active ? "bg-gray-700 text-white" : "bg-white text-gray-700"
      } hover:bg-gray-200`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex gap-2 p-2 border-b border-gray-300 bg-gray-100 rounded"
      ref={toolbarRef}
    >
      {renderButton("B", FORMAT_TEXT_COMMAND, "bold", formats.bold)}
      {renderButton("I", FORMAT_TEXT_COMMAND, "italic", formats.italic)}
      {renderButton("U", FORMAT_TEXT_COMMAND, "underline", formats.underline)}
      {renderButton("S", FORMAT_TEXT_COMMAND, "strikethrough", formats.strikethrough)}
      {renderButton("Code", FORMAT_TEXT_COMMAND, "code", formats.code)}
      {renderButton("Highlight", FORMAT_TEXT_COMMAND, "highlight", formats.highlight)}

      {/* Text alignments */}
      {renderButton("Left", FORMAT_ELEMENT_COMMAND, "left")}
      {renderButton("Center", FORMAT_ELEMENT_COMMAND, "center")}
      {renderButton("Right", FORMAT_ELEMENT_COMMAND, "right")}
      {renderButton("Justify", FORMAT_ELEMENT_COMMAND, "justify")}
    </div>
  );
}
