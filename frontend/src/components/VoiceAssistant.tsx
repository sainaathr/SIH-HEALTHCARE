import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Sparkles, X } from 'lucide-react';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('Listening for voice commands...');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setListening(true);
        setStatusMsg('Listening...');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        handleCommand(spoken);
      };

      recognition.onerror = () => {
        setListening(false);
        setStatusMsg('Voice recognition unavailable or denied. Use text command fallback below.');
      };

      recognition.onend = () => {
        setListening(false);
      };

      try {
        recognition.start();
      } catch (e) {
        console.log("Speech recognition start error:", e);
      }
    } else {
      setStatusMsg('Browser Web Speech API not supported in this browser. Use text fallback below.');
    }
  }, [isOpen]);

  const handleCommand = (commandText: string) => {
    const text = commandText.toLowerCase().trim();
    setTranscript(commandText);

    if (text.includes('critical') || text.includes('high risk')) {
      setStatusMsg('Navigating to Nurse Priority Queue...');
      setTimeout(() => { navigate('/nurse-priority'); onClose(); }, 600);
    } else if (text.includes('p001') || text.includes('eleanor')) {
      setStatusMsg('Opening patient P001 profile...');
      setTimeout(() => { navigate('/patients/1'); onClose(); }, 600);
    } else if (text.includes('p002') || text.includes('arthur')) {
      setStatusMsg('Opening patient P002 profile...');
      setTimeout(() => { navigate('/patients/2'); onClose(); }, 600);
    } else if (text.includes('vitalpass') || text.includes('passport')) {
      setStatusMsg('Opening VitalPass scanner...');
      setTimeout(() => { navigate('/vitalpass'); onClose(); }, 600);
    } else if (text.includes('alert') || text.includes('alerts')) {
      setStatusMsg('Navigating to Alert Center...');
      setTimeout(() => { navigate('/alerts'); onClose(); }, 600);
    } else if (text.includes('location') || text.includes('map')) {
      setStatusMsg('Navigating to Patient GPS Location...');
      setTimeout(() => { navigate('/patients/1'); onClose(); }, 600);
    } else {
      setStatusMsg(`Command unrecognized: "${commandText}". Try saying "Show critical patients" or "Open VitalPass".`);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleCommand(textInput);
      setTextInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden glass-panel">
      <div className="bg-gradient-to-r from-cyan-900 to-slate-900 p-3.5 px-4 flex items-center justify-between border-b border-cyan-500/30">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="font-bold text-sm text-cyan-300">VITALGUARD VOICE ASSISTANT</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          <div className={`p-2 rounded-full ${listening ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
            {listening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-slate-200">{listening ? 'Listening...' : 'Voice Assistant Ready'}</div>
            <div className="text-slate-400 text-[11px]">{statusMsg}</div>
          </div>
        </div>

        {transcript && (
          <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-xs font-mono text-cyan-300">
            "{transcript}"
          </div>
        )}

        <div className="text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Try Voice or Text Commands:</div>
          <div className="flex flex-wrap gap-1">
            {['Show critical patients', 'Show patient P001', 'Open VitalPass', 'Show alerts', 'Show patient location'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommand(cmd)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-slate-700"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Text Fallback */}
        <form onSubmit={handleTextSubmit} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            placeholder="Type command fallback..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button type="submit" className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
