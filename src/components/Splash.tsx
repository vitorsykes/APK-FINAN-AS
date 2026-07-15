import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashProps {
  onFinished: () => void;
}

export default function Splash({ onFinished }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onFinished();
          }, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div id="splash-container" className="fixed inset-0 z-50 flex flex-col justify-between items-center pb-16 pt-24 bg-gradient-to-b from-[#f7f9fb] to-[#eceef0] dark:from-[#0b0f19] dark:to-[#020617] text-[#191c1e] dark:text-[#eff1f3]">
      <div className="flex-1"></div>
      
      {/* Center Branding */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center space-y-6"
      >
        <div className="w-24 h-24 bg-black dark:bg-[#1e293b] text-white rounded-full flex items-center justify-center shadow-2xl relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-dashed border-gray-500/30 rounded-full scale-110 pointer-events-none"
          />
          <Sparkles className="w-12 h-12 text-[#6ffbbe]" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-sans text-black dark:text-white">
          Lumina Finance
        </h1>
        <p className="text-sm font-medium tracking-wide text-gray-400 uppercase font-mono">
          Financial Clarity
        </p>
      </motion.div>

      <div className="flex-1"></div>

      {/* Loading Bar */}
      <div className="flex flex-col items-center space-y-3 opacity-90 max-w-xs w-full px-6">
        <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
          <motion.div 
            className="h-full bg-black dark:bg-[#6ffbbe] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs font-mono text-gray-400 tracking-wider">
          Carregando ambiente seguro... {progress}%
        </p>
      </div>
    </div>
  );
}
