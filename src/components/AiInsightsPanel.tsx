import React from 'react';
import { AiInsights } from '../types/weather';
import { Sparkles, Shirt, Activity, Compass, CheckCircle2 } from 'lucide-react';

interface AiInsightsPanelProps {
  insights: AiInsights | null;
  isLoading: boolean;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({
  insights,
  isLoading,
}) => {
  if (isLoading && !insights) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-6 animate-pulse space-y-4">
          <div className="h-5 w-48 bg-white/10 rounded-lg" />
          <div className="h-16 w-full bg-white/5 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-white/5 rounded-xl" />
            <div className="h-24 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div className="rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Atmospheric Intelligence & Lifestyle Insights
              </h2>
              <p className="text-xs text-slate-400">
                AI-synthesized meteorological assessment and lifestyle advice
              </p>
            </div>
          </div>
        </div>

        {/* AI Synopsis Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {insights.summary}
          </p>
        </div>

        {/* 2-Column Grid: Outfit Recommendation & Activity Readiness */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* OUTFIT & WARDROBE ADVISOR */}
          <div className="lg:col-span-5 rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
                <Shirt className="w-4 h-4" />
                Wardrobe & Attire Recommendation
              </div>

              <h3 className="text-base font-bold text-white mb-1.5">
                {insights.clothingRecommendation.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {insights.clothingRecommendation.description}
              </p>
            </div>

            {/* Unboxed wardrobe item items */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Key Ensemble:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {insights.clothingRecommendation.items.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white/10 border border-white/15 text-slate-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* OUTDOOR ACTIVITY SUITABILITY INDEX */}
          <div className="lg:col-span-7 rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-300 mb-4">
              <Activity className="w-4 h-4" />
              Outdoor Activity Suitability
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {insights.activityScores.map((act, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">
                      {act.activity}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        act.score >= 80
                          ? 'text-emerald-400'
                          : act.score >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {act.score}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        act.score >= 80
                          ? 'bg-emerald-400'
                          : act.score >= 60
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${act.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {act.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Advisory Highlights */}
        {insights.hourlyHighlights && insights.hourlyHighlights.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Timeline Advisory:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.hourlyHighlights.map((tip, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
