import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, Sliders, ArrowRight, Download, RefreshCw, X, Settings2, FileSignature, ChevronDown, Info } from 'lucide-react';
import Button from './ui/Button';

// Simple Tooltip Component
const Tooltip = ({ content, className = "w-48" }: { content: React.ReactNode, className?: string }) => (
  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900/95 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-center backdrop-blur-sm border border-slate-700 ${className}`}>
    {content}
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
  </div>
);

const API_BASE_URL = '';
const DAILY_FREE_LIMIT = 5;

const getOrCreateUserId = (): string => {
  const storageKey = 'greenpdf_user_id';
  if (typeof window === 'undefined') {
    return storageKey;
  }
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const generated = `user_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
};

const CompressorApp: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'Light' | 'Balanced' | 'Max'>('Balanced');
  const [quality, setQuality] = useState<'Reading' | 'Email' | 'Web'>('Web');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(DAILY_FREE_LIMIT);
  const [dailyLimit, setDailyLimit] = useState<number>(DAILY_FREE_LIMIT);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [userId] = useState<string>(() => getOrCreateUserId());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressionLevels = ['Light', 'Balanced', 'Max'] as const;

  const fetchUsage = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoadingUsage(true);
      setUsageError(null);
      const params = new URLSearchParams({ userId });
      const response = await fetch(`${API_BASE_URL}/api/usage?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage');
      }
      const data = await response.json();
      setIsPro(Boolean(data.isPro));
      if (typeof data.dailyLimit === 'number') {
        setDailyLimit(data.dailyLimit);
      }
      if (data.remaining === null || typeof data.remaining === 'number') {
        setRemaining(data.remaining);
      }
    } catch (error) {
      setUsageError('Unable to load usage info. Compression limits may not be enforced.');
    } finally {
      setIsLoadingUsage(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setCustomFilename(droppedFile.name.replace(/\.pdf$/i, '') + '-compressed');
        setIsDone(false);
        setCompressedBlob(null);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
       if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setCustomFilename(selectedFile.name.replace(/\.pdf$/i, '') + '-compressed');
        setIsDone(false);
        setCompressedBlob(null);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleCompress = async () => {
    if (!file || !userId) return;

    if (!isPro && remaining !== null && remaining <= 0) {
      alert('You have reached your free daily limit of PDF compressions. Upgrade to Pro for unlimited access.');
      return;
    }

    setIsCompressing(true);
    setIsDone(false);
    setCompressedBlob(null);
    setUsageError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('compressionLevel', compressionLevel);
      formData.append('quality', quality);

      const response = await fetch(`${API_BASE_URL}/api/compress`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 403) {
        let data: any = null;
        try {
          data = await response.json();
        } catch {
          // ignore
        }
        if (data && data.error === 'LIMIT_REACHED') {
          setRemaining(0);
        }
        alert('You have reached your free daily limit of PDF compressions. Upgrade to Pro for unlimited access.');
        return;
      }

      if (!response.ok) {
        setUsageError('Failed to compress PDF. Please try again.');
        return;
      }

      const remainingHeader = response.headers.get('X-Remaining-Compressions');
      const isProHeader = response.headers.get('X-Is-Pro');

      if (remainingHeader !== null) {
        const parsed = parseInt(remainingHeader, 10);
        if (!Number.isNaN(parsed)) {
          setRemaining(parsed);
        }
      }

      if (isProHeader === 'true') {
        setIsPro(true);
      }

      const blob = await response.blob();
      setCompressedBlob(blob);
      setIsDone(true);
    } catch (error) {
      setUsageError('Unable to reach the compression server. Please make sure the backend is running.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!file && !compressedBlob) return;
    // Since we are now using a backend, we download the compressed blob if available (or fall back to the original file).
    const blobToDownload = compressedBlob || file;
    if (!blobToDownload) return;
    const url = URL.createObjectURL(blobToDownload);
    const a = document.createElement('a');
    a.href = url;
    a.download = customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setCustomFilename('');
    setIsDone(false);
    setIsCompressing(false);
    setCompressedBlob(null);
    setUsageError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    setCompressionLevel(compressionLevels[index]);
  };

  // Mock calculation for compressed size
  const originalSize = file ? file.size : 0;
  const reductionFactor = compressionLevel === 'Max' ? 0.3 : compressionLevel === 'Balanced' ? 0.6 : 0.8;
  const estimatedCompressedSize = Math.floor(originalSize * reductionFactor);
  const actualCompressedSize = compressedBlob ? compressedBlob.size : estimatedCompressedSize;
  const savedPercentage = originalSize
    ? Math.round(((originalSize - actualCompressedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-visible transition-colors duration-300">
      <div className="p-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-t-2xl"></div>
      
      <div className="p-6 md:p-8">
        {!file ? (
          // Upload State
          <div 
            className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out cursor-pointer group
              ${isDragging 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".pdf" 
              onChange={handleFileChange}
            />
            <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 group-hover:scale-110 transition-transform ${isDragging ? 'bg-emerald-100 dark:bg-emerald-900/50' : ''}`}>
              <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your PDF here</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">or click to browse from your computer</p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
              <span>Fast</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>Secure</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>Private</span>
            </div>
          </div>
        ) : !isDone ? (
          // Configuration State
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {/* Free usage bar */}
            <div className="flex items-center justify-between text-xs sm:text-sm mb-4 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Free Plan Usage</span>
                <span className="font-semibold">
                  {isLoadingUsage
                    ? 'Loading...'
                    : isPro
                    ? 'Unlimited (Pro)'
                    : `${Math.max(0, (dailyLimit || DAILY_FREE_LIMIT) - (remaining ?? DAILY_FREE_LIMIT))} / ${dailyLimit} today`}
                </span>
              </div>
              {!isPro && (
                <button
                  type="button"
                  className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                  onClick={() => {
                    const pricing = document.getElementById('pricing');
                    if (pricing) {
                      pricing.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Upgrade for Unlimited
                </button>
              )}
            </div>

            {/* File summary */}
            <div className="flex items-start justify-between mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-xs">
                    {file.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {usageError && (
              <div className="mb-4 text-xs text-red-500 dark:text-red-400">
                {usageError}
              </div>
            )}

            {/* Compression Mode cards */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Compression Mode</span>
              </div>

              <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                {(['Light', 'Balanced', 'Max'] as const).map((level) => {
                  const isSelected = compressionLevel === level;
                  const isRecommended = level === 'Balanced';
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setCompressionLevel(level)}
                      className={
                        `relative text-left rounded-xl border px-4 py-4 sm:py-5 transition-colors ` +
                        (isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-900/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 bg-white dark:bg-slate-800')
                      }
                    >
                      {isRecommended && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                          RECOMMENDED
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {level}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white dark:bg-slate-900">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {level === 'Light' && 'Use for Print'}
                        {level === 'Balanced' && 'Use for Office/Ebook'}
                        {level === 'Max' && 'Use for Web/Email'}
                      </p>
                      <p className="text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                        {level === 'Light' && '300 DPI • HIGH QUALITY'}
                        {level === 'Balanced' && '150 DPI • GOOD QUALITY'}
                        {level === 'Max' && '72 DPI • LOW QUALITY'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Filename */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                <FileSignature className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label htmlFor="filename">Save as</label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="filename"
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-4 pr-12 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 focus:outline-none shadow-sm transition-all"
                  placeholder="Enter filename"
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-slate-50 dark:bg-slate-600 border-l border-slate-200 dark:border-slate-500 rounded-r-lg text-slate-500 dark:text-slate-300 text-sm font-medium">
                  .pdf
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button 
                size="lg" 
                onClick={handleCompress} 
                disabled={
                  isCompressing ||
                  !customFilename.trim() ||
                  (!isPro && remaining !== null && remaining <= 0)
                }
                className="w-full md:w-auto min-w-[200px]"
              >
                {isCompressing ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Compressing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Compress PDF
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Success State
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Compression Complete!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
              <span className="text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{customFilename}.pdf</span> is ready to download.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-8 max-w-lg mx-auto border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Original</p>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 decoration-slate-400 dark:decoration-slate-500 line-through decoration-2">{formatSize(originalSize)}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-white bg-emerald-500 px-3 py-1 rounded-full shadow-sm mb-1">
                        -{savedPercentage}%
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Compressed</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatSize(actualCompressedSize)}</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${100 - savedPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 shadow-emerald-200 dark:shadow-none shadow-lg" onClick={handleDownload}>
                <Download className="w-5 h-5" />
                Download PDF
              </Button>
              <Button variant="outline" size="lg" onClick={reset} className="gap-2">
                Compress Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressorApp;