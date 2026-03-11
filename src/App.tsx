/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import { 
  Calculator, 
  Sparkles, 
  History, 
  Trash2, 
  MessageSquare, 
  ChevronRight, 
  RotateCcw,
  Info,
  X,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { explainCalculation, solveWordProblem } from './services/geminiService';
import { cn } from './lib/utils';

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, aiExplanation]);

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setDisplay(display + ' ' + op + ' ');
  };

  const handleFunction = (fn: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(fn + '(');
    } else {
      setDisplay(display + fn + '(');
    }
  };

  const clear = () => {
    setDisplay('0');
    setAiExplanation(null);
    setExpression('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const calculate = async () => {
    try {
      const result = math.evaluate(display).toString();
      const newHistory = {
        expression: display,
        result,
        timestamp: Date.now(),
      };
      setHistory([newHistory, ...history]);
      setDisplay(result);
      setExpression(display + ' =');
    } catch (error) {
      setDisplay('Error');
    }
  };

  const handleAiExplain = async () => {
    if (display === '0' || display === 'Error') return;
    setIsAiLoading(true);
    setIsAiPanelOpen(true);
    const explanation = await explainCalculation(expression || display, display);
    setAiExplanation(explanation || "No explanation available.");
    setIsAiLoading(false);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    setIsAiLoading(true);
    setIsAiPanelOpen(true);
    const result = await solveWordProblem(aiInput);
    
    if (result.expression) {
      setDisplay(result.expression);
      setAiExplanation(result.explanation);
    } else {
      setAiExplanation(result.explanation);
    }
    
    setAiInput('');
    setIsAiLoading(false);
  };

  const buttons = [
    { label: 'C', action: clear, type: 'util' },
    { label: '(', action: () => handleNumber('('), type: 'util' },
    { label: ')', action: () => handleNumber(')'), type: 'util' },
    { label: '/', action: () => handleOperator('/'), type: 'op' },
    
    { label: 'sin', action: () => handleFunction('sin'), type: 'func' },
    { label: '7', action: () => handleNumber('7'), type: 'num' },
    { label: '8', action: () => handleNumber('8'), type: 'num' },
    { label: '*', action: () => handleOperator('*'), type: 'op' },
    
    { label: 'cos', action: () => handleFunction('cos'), type: 'func' },
    { label: '4', action: () => handleNumber('4'), type: 'num' },
    { label: '5', action: () => handleNumber('5'), type: 'num' },
    { label: '-', action: () => handleOperator('-'), type: 'op' },
    
    { label: 'tan', action: () => handleFunction('tan'), type: 'func' },
    { label: '1', action: () => handleNumber('1'), type: 'num' },
    { label: '2', action: () => handleNumber('2'), type: 'num' },
    { label: '+', action: () => handleOperator('+'), type: 'op' },
    
    { label: 'log', action: () => handleFunction('log'), type: 'func' },
    { label: '0', action: () => handleNumber('0'), type: 'num' },
    { label: '.', action: () => handleNumber('.'), type: 'num' },
    { label: '=', action: calculate, type: 'equal' },
    
    { label: 'sqrt', action: () => handleFunction('sqrt'), type: 'func' },
    { label: '^', action: () => handleOperator('^'), type: 'func' },
    { label: 'pi', action: () => handleNumber('PI'), type: 'func' },
    { label: 'DEL', action: backspace, type: 'util' },
  ];

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] rounded-full flex items-center justify-center text-[#E4E3E0]">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">AI Scientific</h1>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Precision Instrument v1.0</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={cn(
              "p-2 transition-colors rounded-full",
              isHistoryOpen ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414] hover:text-[#E4E3E0]"
            )}
          >
            <History size={20} />
          </button>
          <button 
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className={cn(
              "p-2 transition-colors rounded-full",
              isAiPanelOpen ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414] hover:text-[#E4E3E0]"
            )}
          >
            <Sparkles size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calculator Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] p-8 rounded-2xl">
            {/* Display */}
            <div className="mb-8 text-right space-y-2">
              <div className="h-6 text-sm font-mono opacity-40 overflow-hidden whitespace-nowrap">
                {expression}
              </div>
              <div className="text-5xl font-mono font-bold tracking-tighter break-all">
                {display}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-3">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className={cn(
                    "h-16 rounded-xl text-lg font-bold transition-all active:scale-95 border border-[#141414]",
                    btn.type === 'num' && "bg-white hover:bg-[#F0F0F0]",
                    btn.type === 'op' && "bg-[#F27D26] text-white hover:bg-[#D66A1D]",
                    btn.type === 'func' && "bg-[#141414] text-[#E4E3E0] hover:bg-[#333]",
                    btn.type === 'util' && "bg-[#E4E3E0] hover:bg-[#D4D3D0]",
                    btn.type === 'equal' && "bg-[#141414] text-[#E4E3E0] hover:bg-[#333] col-span-1"
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button 
              onClick={handleAiExplain}
              disabled={isAiLoading || display === '0'}
              className="w-full mt-6 h-14 bg-[#141414] text-[#E4E3E0] rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-[#333] transition-all disabled:opacity-50"
            >
              {isAiLoading ? (
                <RotateCcw className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} />
              )}
              EXPLAIN WITH AI
            </button>
          </div>

          {/* AI Chat Input */}
          <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] p-6 rounded-2xl">
            <h3 className="text-xs font-mono opacity-50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> AI Math Assistant
            </h3>
            <form onSubmit={handleAiSubmit} className="relative">
              <input 
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask a math question or word problem..."
                className="w-full bg-[#F5F5F5] border border-[#141414] rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
              />
              <button 
                type="submit"
                disabled={isAiLoading || !aiInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#141414] text-[#E4E3E0] rounded-lg disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-5 space-y-8">
          {/* AI Explanation Panel */}
          <AnimatePresence>
            {isAiPanelOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#141414] text-[#E4E3E0] rounded-2xl p-6 shadow-2xl relative min-h-[300px]"
              >
                <button 
                  onClick={() => setIsAiPanelOpen(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full"
                >
                  <X size={18} />
                </button>
                
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="text-[#F27D26]" size={20} />
                  <h2 className="font-bold uppercase tracking-tight">AI Insights</h2>
                </div>

                <div className="space-y-4 font-mono text-sm leading-relaxed max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <RotateCcw className="animate-spin text-[#F27D26]" size={32} />
                      <p className="animate-pulse">Analyzing complex patterns...</p>
                    </div>
                  ) : aiExplanation ? (
                    <div className="whitespace-pre-wrap">
                      {aiExplanation}
                    </div>
                  ) : (
                    <div className="opacity-40 italic py-12 text-center">
                      Perform a calculation or ask a question to see AI insights here.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Panel */}
          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-[#141414] rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <History size={18} />
                    <h2 className="font-bold uppercase tracking-tight">History</h2>
                  </div>
                  <button 
                    onClick={() => setHistory([])}
                    className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="text-center py-12 opacity-30 italic text-sm">
                      No calculations yet.
                    </div>
                  ) : (
                    history.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="group border-b border-[#141414]/10 pb-4 last:border-0 cursor-pointer hover:bg-[#F5F5F5] p-2 rounded-lg transition-colors"
                        onClick={() => setDisplay(item.result)}
                      >
                        <div className="text-xs font-mono opacity-40 mb-1">{item.expression}</div>
                        <div className="text-xl font-bold flex justify-between items-center">
                          <span>{item.result}</span>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Tips */}
          <div className="bg-[#F27D26] text-white p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] border border-[#141414]">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} />
              <h3 className="font-bold uppercase text-sm">Pro Tip</h3>
            </div>
            <p className="text-sm leading-snug">
              You can type full word problems like "What is the area of a circle with radius 5?" into the AI Math Assistant.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#141414] p-8 text-center">
        <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
          Built with Precision & Intelligence • © 2026
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(20, 20, 20, 0.2);
          border-radius: 10px;
        }
        .bg-[#141414] .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
