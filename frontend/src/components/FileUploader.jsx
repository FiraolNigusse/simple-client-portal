import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { Button } from "./ui/Button";

export function FileUploader({ projectId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("project", projectId);
    fd.append("file", file);
    fd.append("filename", file.name);

    try {
      const res = await api.post("/files/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUploaded(res.data);
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-portal-text">Deliver Assets</p>
        <p className="text-[11px] text-portal-muted uppercase tracking-wider font-medium mt-0.5">Max size 10MB • JPG, PNG, PDF, ZIP</p>
      </div>
      
      <div className="w-full max-w-sm flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <div className={`border border-slate-700 bg-background rounded-xl px-4 py-2 text-sm text-left truncate transition-all hover:border-slate-500 ${file ? 'text-portal-text border-primary/50' : 'text-slate-500'}`}>
            {file ? file.name : "Select a file..."}
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={e => setFile(e.target.files[0])} 
          />
        </label>
        <Button 
          disabled={!file} 
          loading={loading}
          onClick={handleUpload}
          className="shrink-0"
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
