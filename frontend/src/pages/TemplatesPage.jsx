import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        const json = await response.json();
        if (json.success) {
          setTemplates(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch templates', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleUseTemplate = (template) => {
    // Navigate to generate page and maybe pass state, but for now just go home
    navigate('/', { state: { template } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="font-display text-3xl md:text-5xl tracking-widest mb-4">
          <span className="text-white">SCENE </span>
          <span className="text-gradient">TEMPLATES</span>
        </h1>
        <p className="text-studio-muted text-lg max-w-2xl mx-auto">
          Jumpstart your creative process with our curated collection of professional scene templates.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-studio-neon border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col group cursor-pointer hover:border-studio-neon transition-colors"
              onClick={() => handleUseTemplate(tpl)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-studio-neon group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <h3 className="font-display text-xl text-white">{tpl.name}</h3>
              </div>
              <p className="text-studio-muted text-sm flex-1 leading-relaxed line-clamp-3 mb-6">
                {tpl.description}
              </p>
              <div className="flex items-center text-xs font-mono tracking-widest text-studio-neon uppercase mt-auto">
                <span>Use Template</span>
                <ChevronRight size={14} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </motion.div>
          ))}
          {templates.length === 0 && (
             <div className="col-span-full text-center text-studio-muted py-12">
               No templates available.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
