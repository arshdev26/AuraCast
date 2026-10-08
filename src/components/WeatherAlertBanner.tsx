import React, { useState } from 'react';
import { WeatherAlert } from '../types/weather';
import { weatherNotification } from '../services/notificationService';
import {
  AlertTriangle,
  Bell,
  BellRing,
  ChevronDown,
  ChevronUp,
  X,
  ShieldAlert,
  Flame,
  CloudRain,
  Wind,
  Sun,
  Snowflake,
  Volume2,
  Sparkles,
  Info,
} from 'lucide-react';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
  onDismissAlert?: (id: string) => void;
  onSimulateAlert: (alert: WeatherAlert) => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  alerts,
  onDismissAlert,
  onSimulateAlert,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    weatherNotification.getPermission()
  );
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isSupported = weatherNotification.isSupported();

  const handleRequestPush = async () => {
    const res = await weatherNotification.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      showToast('Push Notifications Activated! You will receive instant severe weather alerts.');
      if (alerts.length > 0) {
        weatherNotification.sendPushAlert(alerts[0], true);
      }
    } else if (res === 'denied') {
      showToast('Notifications were denied in browser permissions.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestChime = (alert: WeatherAlert) => {
    weatherNotification.playAlertChime();
    const sent = weatherNotification.sendPushAlert(alert, true);
    if (!sent && permission !== 'granted') {
      showToast('Alert sound played. Enable Push Notifications for desktop banner alerts.');
    } else if (sent) {
      showToast('Push notification triggered to desktop!');
    }
  };

  const getSeverityStyle = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'emergency':
        return {
          bg: 'bg-rose-950/80 border-rose-500/70 text-rose-100',
          badge: 'bg-rose-600 text-white animate-pulse',
          iconColor: 'text-rose-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/80 border-amber-500/70 text-amber-100',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          iconColor: 'text-amber-400',
        };
      case 'watch':
        return {
          bg: 'bg-yellow-950/70 border-yellow-500/60 text-yellow-100',
          badge: 'bg-yellow-500 text-slate-950 font-semibold',
          iconColor: 'text-yellow-400',
        };
      case 'advisory':
      default:
        return {
          bg: 'bg-sky-950/70 border-sky-500/60 text-sky-100',
          badge: 'bg-sky-500 text-slate-950 font-semibold',
          iconColor: 'text-sky-400',
        };
    }
  };

  const renderAlertIcon = (iconName: WeatherAlert['iconName']) => {
    switch (iconName) {
      case 'thunderstorm':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'temperature-high':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'temperature-low':
        return <Snowflake className="w-5 h-5 text-cyan-300" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-teal-300" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-300" />;
      case 'air':
      default:
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-1 space-y-2">
      {/* Push Notification & Alert Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Severe Weather Alert Radar:</span>
          <span>
            {alerts.length === 0
              ? 'No active severe warnings for this location.'
              : `${alerts.length} active severe weather ${alerts.length === 1 ? 'alert' : 'alerts'}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Permission Button */}
          {isSupported && (
            <button
              onClick={handleRequestPush}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                permission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
              }`}
              title="Configure desktop push notifications for severe weather alerts"
            >
              {permission === 'granted' ? (
                <>
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Push Alerts: Active</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enable Push Notifications</span>
                </>
              )}
            </button>
          )}

          {/* Simulate Alert Testing Button */}
          <button
            onClick={() => setShowSimModal(!showSimModal)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            title="Simulate severe storm, excessive heat, or flash flood warning"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Test Weather Alert</span>
          </button>
        </div>
      </div>

      {/* Simulator Selector Dropdown / Tray */}
      {showSimModal && (
        <div className="p-4 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-amber-400/30 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Severe Weather Alert Simulator
            </span>
            <button
              onClick={() => setShowSimModal(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Select a severe scenario to immediately test visual warning banners, audio alarm chimes, and push notifications:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                onSimulateAlert({
                  id: `sim-storm-${Date.now()}`,
                  title: 'Severe Thunderstorm & Flash Flood Warning',
                  headline: 'Severe squall line with 70 km/h gusts and frequent cloud-to-ground lightning',
                  severity: 'warning',
                  event: 'Severe Thunderstorm',
                  description: 'Doppler radar indicates severe convective squall capable of producing hazardous hail and flash flooding.',
                  instruction: 'Move indoors immediately away from windows. Avoid flooded underpasses.',
                  effectiveTime: 'Immediate',
                  expiresTime: 'In 3 hours',
                  iconName: 'thunderstorm',
                });
                setShowSimModal(false);
              }}
              className="p-3 text-left rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-xs transition-colors"
            >
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Thunderstorm Warning
              </div>
              <p className="text-[11px] text-slate-300 mt-1">70 km/h wind gusts & lightning</p>
            </button>

            <button
              onClick={() => {
                onSimulateAlert({
                  id: `sim-heat-${Date.now()}`,
                  title: 'Excessive Heat & Heatstroke Warning',
                  headline: 'Dangerous heat index surpassing 42°C with high humidity',
                  severity: 'emergency',
                  event: 'Extreme Heat',
                  description: 'Prolonged exposure creates critical danger of heat exhaustion and heatstroke.',
                  instruction: 'Stay in air-conditioned shelters and drink plenty of electrolyte fluids.',
                  effectiveTime: 'Immediate',
                  expiresTime: 'Until 9:00 PM',
                  iconName: 'temperature-high',
                });
                setShowSimModal(false);
              }}
              className="p-3 text-left rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-xs transition-colors"
            >
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Extreme Heat Wave
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Heat index exceeds 42°C</p>
            </button>

            <button
              onClick={() => {
                onSimulateAlert({
                  id: `sim-wind-${Date.now()}`,
                  title: 'High Wind & Gale Force Squall Advisory',
                  headline: 'Severe crosswinds with gusts up to 80 km/h',
                  severity: 'watch',
                  event: 'High Wind',
                  description: 'Strong gusts can knock down tree branches and cause power disruptions.',
                  instruction: 'Secure outdoor items and avoid travel with high-profile trailers.',
                  effectiveTime: 'Immediate',
                  expiresTime: 'In 4 hours',
                  iconName: 'wind',
                });
                setShowSimModal(false);
              }}
              className="p-3 text-left rounded-xl bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-xs transition-colors"
            >
              <div className="font-bold text-sky-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-400" />
                Gale Wind Squall
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Gusts reaching 80 km/h</p>
            </button>
          </div>
        </div>
      )}

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Info className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACTIVE SEVERE WEATHER ALERTS LIST */}
      {alerts.map((alert) => {
        const isExpanded = expandedId === alert.id;
        const style = getSeverityStyle(alert.severity);

        return (
          <div
            key={alert.id}
            className={`rounded-2xl border p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all ${style.bg}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Alert Icon & Beacon */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                    {renderAlertIcon(alert.iconName)}
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                </div>

                {/* Title & Headline */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${style.badge}`}
                    >
                      {alert.severity}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {alert.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1 leading-snug">
                    {alert.headline}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                    <span>Issued: {alert.effectiveTime}</span>
                    <span aria-hidden="true">·</span>
                    <span>Expires: {alert.expiresTime}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Sound, Expand & Dismiss */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleTestChime(alert)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                  title="Play warning chime and trigger notification"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                  title={isExpanded ? 'Collapse instructions' : 'View safety guidance'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {onDismissAlert && (
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Safety Guidance */}
            {isExpanded && (
              <div className="mt-4 pt-3 border-t border-white/15 space-y-2 text-xs animate-fadeIn">
                <div>
                  <span className="font-semibold text-white block mb-0.5">
                    Detailed Meteorological Assessment:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <span className="font-bold text-amber-300 block mb-0.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Recommended Safety Instructions:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {alert.instruction}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};
