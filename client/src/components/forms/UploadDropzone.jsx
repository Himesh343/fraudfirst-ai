import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../common/Button.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { formatFileSize } from "../../utils/privacy.js";
import { validateFiles } from "../../utils/validation.js";

export function UploadDropzone({ files, onAddFiles, onRemoveFile }) {
  const inputRef = useRef(null);
  const [errors, setErrors] = useState([]);

  function handleFiles(fileList) {
    const next = Array.from(fileList || []);
    const validation = validateFiles(files.length, next);
    setErrors(validation);
    if (!validation.length) onAddFiles(next);
  }

  return (
    <section className="upload-zone" aria-labelledby="upload-title">
      <div
        className="drop-target"
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        <Upload size={30} aria-hidden="true" />
        <h3 id="upload-title">Upload screenshot evidence</h3>
        <p>PNG, JPEG or WebP. Up to 4 files, 5 MB each.</p>
        <Button type="button" variant="secondary" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}>Browse files</Button>
        <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => handleFiles(event.target.files)} />
      </div>
      <div aria-live="polite">
        {errors.map((error) => <p className="field-error" key={error}>{error}</p>)}
      </div>
      {files.length ? (
        <ul className="file-list">
          {files.map((item, index) => (
            <li key={item.previewUrl}>
              <img src={item.previewUrl} alt="" />
              <span>
                <strong>{item.file.name}</strong>
                <small>{item.file.type} · {formatFileSize(item.file.size)}</small>
              </span>
              <IconButton label={`Remove ${item.file.name}`} icon={Trash2} onClick={() => onRemoveFile(index)} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
