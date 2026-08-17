import React from 'react';

const ImageUploader = ({ files, setFiles, maxFiles = 3 }) => {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Rule 3 & Backend Enforcement: You can upload a maximum of ${maxFiles} images.`);
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="form-group">
      <label className="form-label">
        Product Images (Minimum 1, Maximum 3 real photos of item) *
      </label>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {files.map((file, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1.5px solid var(--border-medium)',
            }}
          >
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={() => removeFile(idx)}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        ))}

        {files.length < maxFiles && (
          <label
            style={{
              width: '90px',
              height: '90px',
              border: '2px dashed var(--primary-dark)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--primary-light)',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-main)',
            }}
          >
            ➕ Add Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>
      <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        Upload 1 to 3 real photos. Max size 5MB each.
      </small>
    </div>
  );
};

export default ImageUploader;
