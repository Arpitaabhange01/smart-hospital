import { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, Monitor, MonitorOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Telemedicine() {
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.warn('Camera access denied or unavailable');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
  }, []);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  const handleStartCall = async () => {
    await startCamera();
    setInCall(true);
  };

  const handleEndCall = () => {
    stopCamera();
    setInCall(false);
    setScreenShare(false);
  };

  const toggleScreenShare = async () => {
    if (screenShare) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenShare(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setScreenShare(true);
        stream.getVideoTracks()[0].onended = () => setScreenShare(false);
      } catch {}
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => { t.enabled = muted; });
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = videoOff; });
      setVideoOff(!videoOff);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-primary-600" /> Telemedicine
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Start a virtual consultation with your doctor.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
          <AnimatePresence mode="wait">
            {inCall ? (
              <motion.div key="call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${videoOff ? 'hidden' : ''}`} />
                {videoOff && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg">You</div>
                {/* Simulated remote participant */}
                <div className="absolute top-4 right-4 w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-600">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-1">DR</div>
                      <p className="text-xs text-gray-400">Dr. Connected</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-primary-600" />
                </div>
                <p className="text-white font-semibold text-lg">Ready to Connect</p>
                <p className="text-gray-400 text-sm mt-1">Start a video call for your consultation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 flex items-center justify-center gap-3">
          {!inCall ? (
            <button onClick={handleStartCall}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg">
              <Video className="w-5 h-5" /> Start Call
            </button>
          ) : (
            <>
              <button onClick={toggleMute}
                className={`p-3.5 rounded-xl transition-all ${muted ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:shadow-md`}>
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={toggleVideo}
                className={`p-3.5 rounded-xl transition-all ${videoOff ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:shadow-md`}>
                {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button onClick={toggleScreenShare}
                className={`p-3.5 rounded-xl transition-all ${screenShare ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:shadow-md`}>
                {screenShare ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </button>
              <button onClick={handleEndCall}
                className="p-3.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all hover:shadow-md">
                <Phone className="w-5 h-5 rotate-135" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Before Your Call</h3>
          <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex items-center gap-2">• Ensure good lighting</li>
            <li className="flex items-center gap-2">• Use a quiet environment</li>
            <li className="flex items-center gap-2">• Check your internet connection</li>
            <li className="flex items-center gap-2">• Have your medical records ready</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">During Your Call</h3>
          <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex items-center gap-2">• Describe your symptoms clearly</li>
            <li className="flex items-center gap-2">• Ask questions about your treatment</li>
            <li className="flex items-center gap-2">• Share your screen if needed for reports</li>
            <li className="flex items-center gap-2">• The doctor may prescribe medicines</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
