import React, { useRef, useState, useEffect } from 'react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
  cameraSide?: 'front' | 'back';
  showSideSelection?: boolean;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  cameraSide = 'front',
  showSideSelection = false
}) => {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(cameraSide);
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsCameraModalOpen(true);
      setIsPhotoTaken(false);
    } else {
      setIsCameraModalOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let stream: MediaStream | undefined;
    
    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: currentSide === 'front' ? 'user' : 'environment' 
          } 
        });
        const video = document.getElementById("camera-video") as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      } catch (error) {
        console.error("Camera access denied or not available:", error);
        alert("Camera access denied or not available");
        setIsCameraModalOpen(false);
      }
    }
    
    if (isCameraModalOpen && !isPhotoTaken) {
      enableCamera();
    }
    
    return () => {
      // Clean up camera stream when modal closes
      const video = document.getElementById("camera-video") as HTMLVideoElement;
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, [isCameraModalOpen, isPhotoTaken, currentSide]);

  const capturePhoto = () => {
    const video = document.getElementById("camera-video") as HTMLVideoElement;
    const canvas = document.getElementById("camera-canvas") as HTMLCanvasElement;
    
    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL("image/jpeg", 0.8);
        setCurrentPhoto(photoData);
        setIsPhotoTaken(true);
        
        // Stop video stream but keep modal open for preview
        if (video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          video.srcObject = null;
        }
      }
    }
  };

  const stopCamera = () => {
    const video = document.getElementById("camera-video") as HTMLVideoElement;
    if (video && video.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
    setIsCameraModalOpen(false);
    setIsPhotoTaken(false);
  };

  const handleSideChange = (side: 'front' | 'back') => {
    setCurrentSide(side);
    setIsPhotoTaken(false);
  };

  const handleUsePhoto = () => {
    if (currentPhoto) {
      onCapture(currentPhoto);
      onClose();
    }
  };

  const handleRetake = () => {
    setCurrentPhoto("");
    setIsPhotoTaken(false);
  };

  if (!isOpen) return null;

  return (
    <div 
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    width: '100vw',
    height: '100vh',
    // Responsive mobile fix
    ...(window.innerWidth <= 600 ? {
      alignItems: 'flex-end',
      paddingBottom: '0',
    } : {}),
  }}
>

      <div 
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          margin: '16px',
          border: '1px solid #374151',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
            Take Member Photo
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
              fontSize: '18px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Side Selection */}
        {showSideSelection && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => handleSideChange('front')}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: currentSide === 'front' ? '#059669' : '#374151',
                color: currentSide === 'front' ? 'white' : '#d1d5db',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (currentSide !== 'front') {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSide !== 'front') {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
            >
              Front Camera
            </button>
            <button
              type="button"
              onClick={() => handleSideChange('back')}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: currentSide === 'back' ? '#059669' : '#374151',
                color: currentSide === 'back' ? 'white' : '#d1d5db',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (currentSide !== 'back') {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSide !== 'back') {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
            >
              Back Camera
            </button>
          </div>
        )}

        {/* Camera View */}
        <div style={{ marginBottom: '20px' }}>
          {!isPhotoTaken ? (
            <video
              id="camera-video"
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '300px',
                maxHeight: '50vh', // Responsive height for mobile
                borderRadius: '8px',
                border: '1px solid #4b5563',
                backgroundColor: '#000',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <img 
              src={currentPhoto} 
              alt="Captured" 
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'contain',
                backgroundColor: '#374151',
                borderRadius: '8px',
                border: '1px solid #4b5563',
              }}
            />
          )}
          
          {/* Hidden canvas for capturing */}
          <canvas
            id="camera-canvas"
            style={{ display: 'none' }}
          />
        </div>

        {/* Camera Controls */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isPhotoTaken ? (
            <>
              <button
                type="button"
                onClick={capturePhoto}
                style={{
                  flex: 1,
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                Capture
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  padding: '14px 20px',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  flex: 1,
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  padding: '14px 20px',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleUsePhoto}
                style={{
                  flex: 1,
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal; 