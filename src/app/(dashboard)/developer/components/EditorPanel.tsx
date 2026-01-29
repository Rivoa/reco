"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface EditorPanelProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

export function EditorPanel({ code, onChange }: EditorPanelProps) {
  
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Define the "KLAZ Dark" theme to match your app perfectly
    monaco.editor.defineTheme('klaz-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '60a5fa' }, // Blue-400 for keys
        { token: 'string.value.json', foreground: '4ade80' }, // Green-400 for values
        { token: 'number', foreground: 'f472b6' }, // Pink-400 for numbers
        { token: 'keyword', foreground: 'c084fc' }, // Purple-400
        { token: 'delimiter', foreground: '52525b' }, // Zinc-600 for brackets
      ],
      colors: {
        'editor.background': '#0f1117', // Matches your sidebar bg
        'editor.foreground': '#e4e4e7', // Zinc-200
        'editor.lineHighlightBackground': '#18181b', // Zinc-900
        'editorCursor.foreground': '#3b82f6', // Blue cursor
        'editorIndentGuide.background': '#27272a',
        'editorIndentGuide.activeBackground': '#3f3f46',
      }
    });

    // Apply the theme
    monaco.editor.setTheme('klaz-dark');
  };

  return (
    <div className="h-full w-full relative bg-[#0f1117] flex flex-col">
      {/* 1. Inject JetBrains Mono Font via CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
      `}</style>

      {/* 2. Editor Instance */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={code}
          theme="klaz-dark" // Use our custom theme
          onChange={onChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full text-zinc-500 gap-3 bg-[#0f1117]">
              <Loader2 className="animate-spin text-blue-500" size={18} /> 
              <span className="text-xs font-mono tracking-widest uppercase opacity-70">Initializing Core...</span>
            </div>
          }
          options={{
            // --- VISUALS ---
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            fontWeight: "500",
            fontLigatures: true, // Makes => look like an arrow
            lineHeight: 24,      // More breathing room
            
            // --- UI ELEMENTS ---
            minimap: { enabled: false },
            lineNumbers: "on",
            glyphMargin: false, // Remove gutter space if not debugging
            folding: true,
            
            // --- BEHAVIOR ---
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            
            // --- GUIDES ---
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            guides: {
              indentation: true,
              bracketPairs: true // Lines connecting matching brackets
            },
            
            // --- LAYOUT ---
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
          }}
        />
      </div>
      
      {/* 3. Status Bar Footer (Optional Polish) */}
      <div className="h-6 shrink-0 bg-[#0b0d10] border-t border-white/5 flex items-center px-4 justify-end gap-4 text-[9px] font-mono text-zinc-600 select-none">
         <span>JSON</span>
         <span>UTF-8</span>
         <span className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-pulse" />
           Ready
         </span>
      </div>
    </div>
  );
}