
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, X, Volume2, Sparkles, MessageSquare, Loader2 } from 'lucide-react';

// Decoding/Encoding Helpers as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveKitchenAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: any) => {
            // Handle Transcription
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev, { role: 'user', text }]);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev, { role: 'model', text }]);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error("Live Error:", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a hands-free kitchen assistant. Help the user cook. Keep responses brief and verbal. You can hear them while they are busy with their hands.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start Live session", err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col h-full bg-brand-dark rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-300">
      {/* Visualizer/Header */}
      <div className="relative h-48 bg-gradient-to-br from-brand-orange to-red-600 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse"></div>
        </div>
        
        <Sparkles size={32} className="text-white/80 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white mb-2">Live Kitchen Assistant</h2>
        <p className="text-white/80 text-sm font-medium">Hands-free cooking help</p>
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition">
          <X size={20} />
        </button>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 p-6 flex flex-col gap-6 bg-[#121212]">
        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {transcription.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4">
              <Volume2 size={48} className="opacity-20" />
              <p className="max-w-xs text-sm">Once active, start talking! I'll hear your questions even if your hands are covered in flour.</p>
            </div>
          ) : (
            transcription.map((t, i) => (
              <div key={i} className={`flex gap-3 animate-in slide-in-from-bottom-2 ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${t.role === 'user' ? 'bg-brand-orange text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}>
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 py-4 border-t border-white/5">
          {isConnecting ? (
            <div className="flex items-center gap-3 text-brand-orange font-bold animate-pulse">
               <Loader2 className="animate-spin" /> Initializing Live Chef...
            </div>
          ) : (
            <button 
              onClick={isActive ? stopSession : startSession}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 relative ${isActive ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-brand-orange text-white shadow-orange-500/20'}`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
              )}
              {isActive ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          )}
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {isActive ? 'Live • Tap to End' : 'Tap to Start Voice Session'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveKitchenAssistant;
