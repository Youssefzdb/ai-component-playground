const IMPORT_MAP = {
  imports: {
    react: "https://esm.sh/react@18.3.1",
    "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1",
    "lucide-react": "https://esm.sh/lucide-react@0.460.0?deps=react@18.3.1",
  },
};

/** Builds a self-contained HTML document that compiles and renders App.tsx in the browser. */
export function buildPreviewHtml(code: string): string {
  const encoded = JSON.stringify(code).replace(/<\/script/gi, "<\\/script");
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/@babel/standalone@7.25.6/babel.min.js"></script>
<script type="importmap">${JSON.stringify(IMPORT_MAP)}</script>
<style>body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif}#__err{display:none;position:fixed;inset:0;padding:24px;background:#1a0b0b;color:#fca5a5;font:13px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow:auto}</style>
</head><body><div id="root"></div><div id="__err"></div>
<script>
function __showErr(e){var el=document.getElementById('__err');el.style.display='block';el.textContent='⚠ '+(e&&e.message||e);}
window.addEventListener('error',function(e){__showErr(e.error||e.message)});
window.addEventListener('unhandledrejection',function(e){__showErr(e.reason)});
try{
  var src=${encoded};
  var out=Babel.transform(src,{filename:'App.tsx',presets:[['react',{runtime:'automatic'}],'typescript']}).code;
  var url=URL.createObjectURL(new Blob([out],{type:'text/javascript'}));
  var boot="import App from '"+url+"';import {createRoot} from 'react-dom/client';import {jsx} from 'react/jsx-runtime';createRoot(document.getElementById('root')).render(jsx(App,{}));";
  var s=document.createElement('script');s.type='module';s.textContent=boot;document.body.appendChild(s);
}catch(e){__showErr(e)}
</script></body></html>`;
}

export function buildProjectFiles(code: string): Record<string, string> {
  return {
    "package.json": JSON.stringify(
      {
        name: "generated-app",
        private: true,
        type: "module",
        scripts: { dev: "vite", build: "vite build" },
        dependencies: { react: "^18.3.1", "react-dom": "^18.3.1", "lucide-react": "^0.460.0" },
        devDependencies: { vite: "^5.4.0", "@vitejs/plugin-react": "^4.3.0", typescript: "^5.5.0", tailwindcss: "^3.4.0", postcss: "^8.4.0", autoprefixer: "^10.4.0" },
      },
      null,
      2,
    ),
    "vite.config.ts": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nexport default defineConfig({ plugins: [react()] });\n`,
    "tailwind.config.js": `export default { content: ["./index.html", "./src/**/*.{ts,tsx}"], theme: { extend: {} }, plugins: [] };\n`,
    "postcss.config.js": `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`,
    "index.html": `<!doctype html>\n<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Generated App</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
    "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
    "src/main.tsx": `import { createRoot } from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\ncreateRoot(document.getElementById("root")!).render(<App />);\n`,
    "src/App.tsx": code + "\n",
  };
}
