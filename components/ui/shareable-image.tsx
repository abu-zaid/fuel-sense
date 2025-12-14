'use client';

import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Download } from 'lucide-react';
import { toast } from './toast';

interface ShareableImageProps {
  elementId: string;
  fileName?: string;
  title?: string;
}

export function useShareableImage() {
  const generateImage = async (elementId: string): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Element not found');
      return null;
    }

    try {
      // Generate PNG from element
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2, // Higher quality
        backgroundColor: '#ffffff',
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      return blob;
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('Failed to generate image');
      return null;
    }
  };

  const shareImage = async (elementId: string, fileName: string = 'fuel-stats.png', title: string = 'Fuel Statistics') => {
    const blob = await generateImage(elementId);
    if (!blob) return;

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            text: 'Check out my fuel statistics!',
            files: [file],
          });
          toast.success('Shared successfully');
          return;
        }
      }

      // Fallback: Download the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share image');
    }
  };

  const downloadImage = async (elementId: string, fileName: string = 'fuel-stats.png') => {
    const blob = await generateImage(elementId);
    if (!blob) return;

    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Failed to download image');
    }
  };

  return {
    shareImage,
    downloadImage,
  };
}

// Share button component
export function ShareButton({ elementId, fileName, title }: ShareableImageProps) {
  const { shareImage } = useShareableImage();

  return (
    <button
      onClick={() => shareImage(elementId, fileName, title)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span>Share</span>
    </button>
  );
}

// Download button component
export function DownloadButton({ elementId, fileName }: ShareableImageProps) {
  const { downloadImage } = useShareableImage();

  return (
    <button
      onClick={() => downloadImage(elementId, fileName)}
      className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Download</span>
    </button>
  );
}
