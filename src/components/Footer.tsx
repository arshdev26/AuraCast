import React, { useState } from 'react';

interface FooterProps {
  onGoHome?: () => void;
  isWeatherLoaded?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onGoHome, isWeatherLoaded = true }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleNavClick = (tab: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (tab === 'Home') {
      if (onGoHome) onGoHome();
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveModal(tab);
    }
  };

  return (
    <footer
      id="footer"
      className={`relative z-20 flex flex-col items-center justify-around w-full py-16 text-sm transition-all duration-1000 ${
        isWeatherLoaded
          ? 'bg-slate-50 text-gray-800/70 border-t border-slate-200 shadow-xl'
          : 'default-app-gradient text-gray-800/80 border-t border-black/10'
      }`}
      style={
        !isWeatherLoaded
          ? {
              backgroundColor: '#91cde6',
              backgroundImage:
                'linear-gradient(90deg, rgba(145, 205, 230, 1) 0%, rgba(141, 227, 177, 1) 50%, rgba(230, 218, 117, 1) 100%)',
            }
          : undefined
      }
    >
      <div className="flex items-center gap-8">
        <a
          href="#"
          onClick={(e) => handleNavClick('Home', e)}
          className="font-medium text-gray-500 hover:text-black transition-all"
        >
          Home
        </a>
        <a
          href="#about"
          onClick={(e) => handleNavClick('About', e)}
          className="font-medium text-gray-500 hover:text-black transition-all"
        >
          About
        </a>
        <a
          href="#services"
          onClick={(e) => handleNavClick('Services', e)}
          className="font-medium text-gray-500 hover:text-black transition-all"
        >
          Services
        </a>
        <a
          href="#contact"
          onClick={(e) => handleNavClick('Contact', e)}
          className="font-medium text-gray-500 hover:text-black transition-all"
        >
          Contact
        </a>
        <a
          href="#help"
          onClick={(e) => handleNavClick('Help', e)}
          className="font-medium text-gray-500 hover:text-black transition-all"
        >
          Help
        </a>
      </div>

      <div className="flex items-center gap-4 mt-8 text-indigo-500">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6M6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter / X"
          className="hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 18c-4.51 2-5-2-7-2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <p className="mt-8 text-center text-gray-800">
        Copyright © 2025{' '}
        <span className="font-semibold text-indigo-600">ArshDev</span>. All rights reservered.{' '}
        <span className="inline-block ml-1 font-semibold text-indigo-700">
          ©️ @ArshDev
        </span>
      </p>

      {/* Interactive modal for footer menu items */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">{activeModal}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {activeModal === 'About' &&
                'AuraCast is an atmospheric weather platform built with real-time telemetry, live cloud visualizations, and extended multi-day forecasts.'}
              {activeModal === 'Services' &&
                'Delivering live microclimate observations, procedural weather acoustics, high-precision telemetry (0.1°), and severe alert notifications.'}
              {activeModal === 'Contact' &&
                'For developer inquiries, feature feedback, or collaborations, contact @ArshDev or visit the project repository.'}
              {activeModal === 'Help' &&
                'Search for any city worldwide using the top search bar, use your live geolocation, switch temperature units, or simulate weather alerts.'}
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
