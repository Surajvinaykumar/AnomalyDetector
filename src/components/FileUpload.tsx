import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const { isAuthenticated } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Supported file formats
  const supportedFormats = ['json', 'csv', 'xml', 'log'];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('You must be logged in to upload files');
      return;
    }
    
    // Check file type
    const allowedExtensions = ['.json', '.csv', '.xml', '.log'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      alert('File type not allowed. Supported formats: JSON, CSV, XML, and log files.');
      return;
    }
    
    setUploadedFile(file);
    
    // Upload file to backend
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        onFileUpload(file, data.file.content);
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleInputChange}
          accept=".json,.csv,.xml,.log"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {uploadedFile ? (
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
              <div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
              <div>
                <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Drop your files here
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse your files (JSON, CSV, XML, log)
                </p>
              </div>
            </>
          )}
          
          <div className="flex flex-wrap gap-2 justify-center">
            {supportedFormats.map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full border border-gray-300 dark:border-gray-600"
              >
                .{format}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;