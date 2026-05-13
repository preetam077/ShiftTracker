'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Download,
  Edit3,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
  Check,
  Paperclip,
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Document, formatFileSize, getFileIcon } from '@/lib/documents';

function FileIcon({ mimeType, size = 20 }: { mimeType: string; size?: number }) {
  const type = getFileIcon(mimeType);
  switch (type) {
    case 'pdf':
      return <FileText size={size} className="text-red-400" />;
    case 'image':
      return <Image size={size} className="text-blue-400" />;
    case 'document':
      return <FileText size={size} className="text-[var(--accent-purple)]" />;
    case 'spreadsheet':
      return <FileSpreadsheet size={size} className="text-green-400" />;
    default:
      return <File size={size} className="text-[var(--text-muted)]" />;
  }
}

function DocumentCard({
  doc,
  onDownload,
  onDelete,
  onRename,
}: {
  doc: Document;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(doc.name);
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== doc.name) {
      onRename(doc.id, editName.trim());
    }
    setEditing(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload(doc);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(doc);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const dateStr = new Date(doc.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="glass-card p-4 fade-up group" style={{ animationDelay: '0.05s', opacity: 0 }}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <FileIcon mimeType={doc.mimeType} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                className="input-base text-sm py-1 px-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setEditing(false);
                }}
                autoFocus
              />
              <button onClick={handleRename} className="btn-ghost p-1 rounded-lg">
                <Check size={14} className="text-[var(--accent-teal)]" />
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost p-1 rounded-lg">
                <X size={14} />
              </button>
            </div>
          ) : (
            <h3
              className="text-sm font-semibold text-[var(--text-primary)] truncate cursor-pointer hover:text-[var(--accent-purple)] transition-colors"
              title={doc.name}
              onClick={() => {
                setEditName(doc.name);
                setEditing(true);
              }}
            >
              {doc.name}
            </h3>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate" title={doc.fileName}>
            {doc.fileName}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-[var(--text-muted)]">{formatFileSize(doc.fileSize)}</span>
            <span className="text-[10px] text-[var(--text-muted)]">·</span>
            <span className="text-[10px] text-[var(--text-muted)]">{dateStr}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => {
              setEditName(doc.name);
              setEditing(true);
            }}
            className="btn-ghost p-1.5 rounded-lg"
            title="Rename"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDownload}
            className="btn-ghost p-1.5 rounded-lg"
            title="Download"
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} className="text-[var(--accent-teal)]" />
            )}
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-all ${
              confirmDelete
                ? 'bg-red-500/20 text-red-400'
                : 'btn-ghost'
            }`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            <Trash2 size={14} className={confirmDelete ? 'text-red-400' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { documents, loading, uploading, upload, download, remove, rename } = useDocuments();
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Pre-fill display name with filename without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setDisplayName(nameWithoutExt);
  };

  const handleUpload = async () => {
    if (!selectedFile || !displayName.trim()) return;
    try {
      await upload(selectedFile, displayName.trim());
      setShowUploadModal(false);
      setSelectedFile(null);
      setDisplayName('');
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
      setShowUploadModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pt-10 lg:pt-0">
        <div className="h-10 shimmer rounded-xl w-48" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 pt-10 lg:pt-0"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Documents</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            Upload and manage your payslips, contracts & more
          </p>
        </div>
        <button
          className="btn-primary text-sm"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={15} />
          Upload File
        </button>
      </div>

      {/* Search */}
      {documents.length > 0 && (
        <div className="relative fade-up fade-up-delay-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            className="input-base pl-9 text-sm"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Drag overlay */}
      {dragOver && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 100,
            background: 'rgba(10, 12, 18, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(124,111,234,0.3), rgba(18,216,192,0.15))' }}
            >
              <Upload size={32} className="text-[var(--accent-purple)]" />
            </div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">Drop your file here</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Release to upload</p>
          </div>
        </div>
      )}

      {/* Document list */}
      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDownload={download}
              onDelete={remove}
              onRename={rename}
            />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="glass-card p-8 text-center fade-up">
          <Search size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">No documents match your search</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Try a different keyword</p>
        </div>
      ) : (
        <div className="glass-card p-12 text-center fade-up fade-up-delay-1">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(124,111,234,0.2), rgba(18,216,192,0.1))' }}
          >
            <Paperclip size={28} className="text-[var(--accent-purple)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">No documents yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 mb-5">
            Upload your payslips, contracts, or any work-related documents
          </p>
          <button
            className="btn-primary text-sm mx-auto"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={15} />
            Upload Your First File
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 100,
            background: 'rgba(10, 12, 18, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadModal(false);
              setSelectedFile(null);
              setDisplayName('');
            }
          }}
        >
          <div
            className="glass-card w-full max-w-md p-6 fade-up"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Upload Document</h2>
              <button
                className="btn-ghost p-1.5 rounded-lg"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDisplayName('');
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* File picker area */}
            {!selectedFile ? (
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-[var(--accent-purple)]"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <Upload size={24} className="text-[var(--accent-purple)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Click to select a file
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  or drag and drop anywhere on the page
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-3">
                  PDF, images, documents, spreadsheets — up to 50 MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected file preview */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <FileIcon mimeType={selectedFile.type} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    className="btn-ghost p-1 rounded-lg flex-shrink-0"
                    onClick={() => {
                      setSelectedFile(null);
                      setDisplayName('');
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Display name input */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                    Document Name
                  </label>
                  <input
                    type="text"
                    className="input-base text-sm"
                    placeholder="e.g. April 2025 Payslip"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpload();
                    }}
                    autoFocus
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Give this document a descriptive name for easy searching
                  </p>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="*/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                // Reset so same file can be picked again
                e.target.value = '';
              }}
            />

            {/* Actions */}
            {selectedFile && (
              <div className="flex items-center gap-3 mt-6">
                <button
                  className="btn-secondary text-sm flex-1"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setDisplayName('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary text-sm flex-1"
                  onClick={handleUpload}
                  disabled={uploading || !displayName.trim()}
                  style={{
                    opacity: uploading || !displayName.trim() ? 0.5 : 1,
                    pointerEvents: uploading || !displayName.trim() ? 'none' : 'auto',
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      Upload
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
