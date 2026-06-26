import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import api, { mediaUrl } from "@/lib/api";

export const ImageUploader = ({ images = [], onChange, multiple = true, testid = "uploader" }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        urls.push(data.url);
      }
      onChange(multiple ? [...images, ...urls] : urls.slice(0, 1));
    } catch {
      toast.error("Nahrání obrázku selhalo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-24 h-20 border border-gray-200 overflow-hidden group">
            <img src={mediaUrl(img)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              data-testid={`${testid}-remove-${i}`}
              className="absolute top-1 right-1 bg-[#DC1C2E] text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => e.target.files.length && handleFiles(e.target.files)} data-testid={`${testid}-input`} />
      <button
        type="button"
        onClick={() => inputRef.current.click()}
        disabled={uploading}
        data-testid={`${testid}-btn`}
        className="inline-flex items-center gap-2 border border-gray-300 hover:border-[#003DA5] text-sm font-bold px-4 py-2 transition-colors disabled:opacity-60"
      >
        <Upload size={16} /> {uploading ? "Nahrávání…" : "Nahrát obrázek"}
      </button>
    </div>
  );
};
