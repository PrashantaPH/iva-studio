import { Box, useColorModeValue } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";

interface CodeEditorPanelProps {
  value: string;
  language?: string;
  height?: string | number;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function CodeEditorPanel({
  value,
  language = "javascript",
  height = 320,
  readOnly = false,
  onChange,
}: CodeEditorPanelProps) {
  const editorTheme = useColorModeValue("light", "vs-dark");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      rounded="md"
      overflow="hidden"
    >
      <Editor
        height={height}
        language={language}
        theme={editorTheme}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 13,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </Box>
  );
}
