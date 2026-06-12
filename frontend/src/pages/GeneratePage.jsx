import React, { useState } from 'react';
import { generateShotList } from '../utils/api';
import InputForm from '../components/InputForm';
import OutputDisplay from '../components/OutputDisplay';
import ClapperLoader from '../components/ClapperLoader';
import toast from 'react-hot-toast';
import { MonitorPlay } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputs, setInputs] = useState(null);
  const [generationId, setGenerationId] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setResult(null);
    setInputs(formData);
    try {
      const res = await generateShotList(formData);
      if (res.success) {
        setResult(res);
        setGenerationId(res.id);
        toast.success(`Shot list ready — ${res.data.shots?.length || 1} shots generated!`, { icon: '🎬', duration: 4000 });
        setTimeout(() => {
          document.getElementById('output')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (e) {
      toast.error(e.message || 'Generation failed. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (inputs) handleSubmit(inputs);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-studio-neon/50" />
          <span className="text-xs tracking-widest font-mono text-studio-neon">
            CREATIVE AI ASSISTANT
          </span>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-studio-neon/50" />
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-widest mb-6 drop-shadow-2xl">
          <span className="text-white">SHOT LIST </span>
          <span className="text-gradient">GENERATOR</span>
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-studio-muted font-light leading-relaxed">
          Describe your scene. Let our AI craft a professional, director-quality shot list in seconds.
        </p>


      </motion.div>

      {/* Main grid */}
      <div className={`grid gap-8 transition-all duration-700 ease-in-out ${result && !loading ? 'grid-cols-1 xl:grid-cols-[1fr_1.5fr]' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
        <div>
          <InputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        <div id="output" className="relative">
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center min-h-[400px]">
              <ClapperLoader />
            </motion.div>
          )}
          
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <OutputDisplay
                result={result}
                inputs={inputs}
                onRegenerate={handleRegenerate}
                generationId={generationId}
              />
            </motion.div>
          )}
          
          {!result && !loading && (
            <div className="hidden xl:flex flex-col items-center justify-center h-full min-h-[500px] rounded-3xl border border-dashed border-white/10 bg-black/20 backdrop-blur-sm">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <MonitorPlay size={64} className="opacity-10 mb-6 text-white" />
              </motion.div>
              <p className="text-sm tracking-wider text-studio-muted opacity-50 uppercase">Your shot list will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
