'use client';

import { useState } from 'react';

export default function UploadWorkout() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      alert('Please select a video file first');
      return;
    }

    setUploading(true);
    setResponseMessage('');

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const res = await fetch('https://squat-analyzer-api.onrender.com/upload_video', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResponseMessage(data.message || 'Upload successful!');
    } catch (err: any) {
      console.error('Upload error:', err);
      setResponseMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Your Workout</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="mb-4 block"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {responseMessage && (
        <p className="mt-4 text-gray-700">{responseMessage}</p>
      )}
    </div>
  );
}
