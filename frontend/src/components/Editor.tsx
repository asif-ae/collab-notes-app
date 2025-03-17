import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, LexicalEditor } from "lexical";
import ToolbarPlugin from "./ToolbarPlugin";

// ✅ Correct Nodes from '@lexical/rich-text' and others
import { CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ParagraphNode, TextNode } from "lexical"; // Core nodes, correctly imported

const placeholder = "Enter some rich text...";

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  setContent: (content: string) => void;
  editorRef: React.RefObject<LexicalEditor | null>;
  isRemoteUpdate: React.RefObject<boolean>;
}

export default function RichTextEditor({
  content,
  onChange,
  editorRef,
  isRemoteUpdate,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "MyEditor",
    theme: {
      paragraph: "editor-paragraph",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        code: "bg-gray-200 p-1 rounded text-sm font-mono",
      },
    },
    // ✅ Safely initialize editor state from provided content
    editorState:
      content && content.trim() !== ""
        ? (editor: LexicalEditor) => {
            try {
              const editorState = editor.parseEditorState(content);
              editor.setEditorState(editorState);
            } catch (err) {
              console.error("Failed to parse editor state:", err);
            }
          }
        : undefined,
    onError: (error: Error) => console.error(error),
    nodes: [
      TextNode,
      ParagraphNode,
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      LinkNode,
      AutoLinkNode,
      HorizontalRuleNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container space-y-4 border p-4 rounded">
        {/* ✅ Toolbar */}
        <ToolbarPlugin />

        {/* ✅ Main Editor */}
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input min-h-[300px] p-3 border rounded" />
          }
          placeholder={<div className="editor-placeholder">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />

        {/* ✅ History and Undo/Redo */}
        <HistoryPlugin />

        {/* ✅ Handle OnChange and return serialized JSON */}
        <OnChangePlugin
          onChange={(editorState: EditorState) => {
            console.log('sjkdghsdkjghdsgdsgsdg')
            if (isRemoteUpdate.current) {
              console.log("⚠️ Ignoring onChange because it's a socket-applied update");
              return;
            }
        
            // Process user changes normally
            editorState.read(() => {
              const json = JSON.stringify(editorState);
              onChange(json); // Emit to socket or parent
            });
          }}
        />

        <EditorRefPlugin editorRef={editorRef} />
      </div>
    </LexicalComposer>
  );
}
