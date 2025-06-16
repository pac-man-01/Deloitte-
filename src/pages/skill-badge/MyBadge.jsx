import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getBaseURL } from "@/utils/getBaseURL";
import { useAuth } from "@/context/AuthContext";

// Badge SVG Icons (unchanged)
export const IronIcon = (
  <svg width="72" height="72" viewBox="0 0 54 54" fill="none">
    <defs>
      <radialGradient id="ironGradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#bbb" />
        <stop offset="100%" stopColor="#6e6259" />
      </radialGradient>
    </defs>
    <circle cx="27" cy="27" r="24" fill="url(#ironGradient)" stroke="#444" strokeWidth="3" />
    <rect x="18" y="14" width="18" height="26" rx="9" fill="#666" opacity="0.25" />
    <rect x="24" y="23" width="6" height="11" rx="3" fill="#444" />
  </svg>
);

export const BronzeIcon = (
  <svg width="72" height="72" viewBox="0 0 54 54" fill="none">
    <defs>
      <radialGradient id="bronzeGradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#f6e27a" />
        <stop offset="100%" stopColor="#a77044" />
      </radialGradient>
    </defs>
    <circle cx="27" cy="27" r="24" fill="url(#bronzeGradient)" stroke="#a77044" strokeWidth="3" />
    <rect x="18" y="14" width="18" height="26" rx="9" fill="#a77044" opacity="0.18" />
    <rect x="24" y="23" width="6" height="11" rx="3" fill="#a77044" />
  </svg>
);

export const SilverIcon = (
  <svg width="72" height="72" viewBox="0 0 54 54" fill="none">
    <defs>
      <radialGradient id="silverGradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#f5f6fa" />
        <stop offset="100%" stopColor="#b4b5b8" />
      </radialGradient>
    </defs>
    <circle cx="27" cy="27" r="24" fill="url(#silverGradient)" stroke="#b4b5b8" strokeWidth="3" />
    <rect x="18" y="14" width="18" height="26" rx="9" fill="#b4b5b8" opacity="0.22" />
    <rect x="24" y="23" width="6" height="11" rx="3" fill="#b4b5b8" />
  </svg>
);

export const GoldIcon = (
  <svg width="72" height="72" viewBox="0 0 54 54" fill="none">
    <defs>
      <radialGradient id="goldGradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#fff2a6" />
        <stop offset="100%" stopColor="#f0c419" />
      </radialGradient>
    </defs>
    <circle cx="27" cy="27" r="24" fill="url(#goldGradient)" stroke="#fcba04" strokeWidth="3" />
    <rect x="18" y="14" width="18" height="26" rx="9" fill="#f0c419" opacity="0.17" />
    <rect x="24" y="23" width="6" height="11" rx="3" fill="#f0c419" />
  </svg>
);

export const PlatinumIcon = (
  <svg width="72" height="72" viewBox="0 0 54 54" fill="none">
    <defs>
      <radialGradient id="platinumGradient" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#eaf6fb" />
        <stop offset="100%" stopColor="#7de2fc" />
      </radialGradient>
    </defs>
    <circle cx="27" cy="27" r="24" fill="url(#platinumGradient)" stroke="#5ad2f4" strokeWidth="3" />
    <rect x="18" y="14" width="18" height="26" rx="9" fill="#67d8ef" opacity="0.13" />
    <rect x="24" y="23" width="6" height="11" rx="3" fill="#67d8ef" />
  </svg>
);

const badgeVisuals = {
  Iron: {
    gradient:
      "bg-neutral-900",
    ring: "ring-4 ring-neutral-700/70",
    glow: "shadow-[0_0_60px_0_rgba(71,85,105,0.4)]",
    icon: IronIcon,
    accent: "from-slate-400 via-slate-300 to-slate-500",
    shimmer: "before:bg-gradient-to-r before:from-transparent before:via-slate-300/20 before:to-transparent",
  },
  Bronze: {
    gradient:
      "bg-neutral-900",
    ring: "ring-4 ring-neutral-700/70",
    glow: "shadow-[0_0_60px_0_rgba(251,191,36,0.4)]",
    icon: BronzeIcon,
    accent: "from-amber-400 via-yellow-300 to-orange-500",
    shimmer: "before:bg-gradient-to-r before:from-transparent before:via-amber-300/20 before:to-transparent",
  },
  Silver: {
    gradient:
      "bg-neutral-900",
    ring: "ring-4 ring-neutral-700/70",
    glow: "shadow-[0_0_60px_0_rgba(156,163,175,0.4)]",
    icon: SilverIcon,
    accent: "from-gray-300 via-white to-gray-400",
    shimmer: "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
  },
  Gold: {
    gradient:
      "bg-neutral-900",
    ring: "ring-4 ring-neutral-700/70",
    glow: "shadow-[0_0_60px_0_rgba(251,191,36,0.5)]",
    icon: GoldIcon,
    accent: "from-yellow-300 via-yellow-200 to-amber-400",
    shimmer: "before:bg-gradient-to-r before:from-transparent before:via-yellow-200/25 before:to-transparent",
  },
  Platinum: {
    gradient:
      "bg-neutral-900",
    ring: "ring-4 ring-neutral-700/70",
    glow: "shadow-[0_0_60px_0_rgba(34,211,238,0.4)]",
    icon: PlatinumIcon,
    accent: "from-cyan-300 via-blue-200 to-indigo-400",
    shimmer: "before:bg-gradient-to-r before:from-transparent before:via-cyan-200/20 before:to-transparent",
  },
};

const fallbackVisual = {
  gradient: "bg-neutral-900",
  ring: "ring-4 ring-neutral-700/70",
  glow: "shadow-[0_0_40px_0_rgba(55,65,81,0.25)]",
  icon: "🏅",
  accent: "from-neutral-400 via-neutral-300 to-neutral-500",
  shimmer: "before:bg-gradient-to-r before:from-transparent before:via-neutral-300/20 before:to-transparent",
};

const GlassCard = ({
  children,
  onMouseMove,
  onMouseLeave,
  tiltStyle,
  borderStyle,
}) => (
  <div className="relative group" style={{ perspective: "1200px" }}>
    <div
      className="relative bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.04] hover:shadow-3xl group"
      style={tiltStyle}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
    <style>{`
      @keyframes spin-y-continuous {
        0% { transform: rotateY(0deg);}
        100% { transform: rotateY(360deg);}
      }
      .revolve-on-hover {
        will-change: transform;
        transition: transform 0.5s cubic-bezier(.4,2,.6,1);
      }
      .group:hover .revolve-on-hover {
        animation: spin-y-continuous 1s linear infinite;
      }
    `}</style>
  </div>
);

const Badge3D = ({
  badge_name,
  course_name,
  hours_completed,
  assessment_status,
  project_experience_months,
  certification_url,
}) => {
  const visuals = badgeVisuals[badge_name] || fallbackVisual;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  //3D effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    setIsHovered(true);
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const maxTilt = 12;
    const rotY = ((x - midX) / midX) * maxTilt;
    const rotX = -((y - midY) / midY) * maxTilt;
    setTilt({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Get icon component and render inside ring, all strictly inside the card
  const IconComponent = visuals.icon;

  return (
    <div ref={cardRef} className="animate-float">
      <GlassCard
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tiltStyle={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition:
            tilt.x === 0 && tilt.y === 0
              ? "transform 0.8s cubic-bezier(.19,1,.22,1)"
              : "transform 0.15s cubic-bezier(.19,1,.22,1)",
        }}
        borderStyle={`linear-gradient(270deg, ${visuals.accent})`}
      >
        <div
          className={`
            flex flex-col items-center p-8 min-h-[360px]
            ${visuals.gradient}
            ${visuals.glow}
            rounded-3xl
            relative
            transition-all duration-500
            overflow-hidden
          `}
          style={{
            boxShadow:
              "0 8px 40px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/3 to-transparent rounded-full blur-xl" />
          
          {/* 3D Ring with revolving icon (on hover only) */}
          <div
            className={`
              flex items-center justify-center
              rounded-full
              ${visuals.ring}
              bg-gradient-to-br from-white/15 to-white/5
              transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
              mb-6
              mt-4
              shimmer-effect
              relative
              backdrop-blur-sm
            `}
            style={{
              width: "128px",
              height: "128px",
              boxShadow: "0 12px 48px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
              overflow: "visible",
              position: "relative",
            }}
          >
            {/* Inner glow ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
            
            {/* Revolving icon on Y axis, only on hover, continuous */}
            <div 
              className="revolve-on-hover flex items-center justify-center w-full h-full"
              style={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            >
              {IconComponent}
            </div>
            
            {/* Shimmer effect overlay */}
            <div className={`absolute inset-0 rounded-full ${visuals.shimmer}`} />
          </div>

          {/* Enhanced Badge Info */}
          <div className="mt-4 text-center flex flex-col items-center z-10 relative">
            <div className="mb-3">
              <h3 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {badge_name} Badge
              </h3>
            </div>
            <div className="relative w-full flex justify-center mb-4">
              <div className="bg-black/40 backdrop-blur-sm border border-white/20 text-white text-base font-semibold px-5 py-2 rounded-2xl shadow-lg tracking-wide whitespace-nowrap relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
                <span className="relative z-10">{course_name}</span>
              </div>
            </div>
            <div className="text-sm text-gray-200 mb-4 space-y-2 font-medium">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" />
                <span><span className="font-bold text-white">{hours_completed}</span> Hours Completed</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${assessment_status ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-pink-400'} animate-pulse`} />
                <span>Assessment: <span className="font-bold text-white">{assessment_status ? "Completed" : "Pending"}</span></span>
              </div>
              {project_experience_months !== undefined && project_experience_months !== null && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse" />
                  <span>Project: <span className="font-bold text-white">{project_experience_months} month{project_experience_months !== 1 ? "s" : ""}</span></span>
                </div>
              )}
            </div>

            {certification_url && (
              <a
                href={certification_url}
                className="group/btn inline-flex items-center px-6 py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm relative overflow-hidden"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Certificate
                </span>
              </a>
            )}
          </div>

          {/* Enhanced bottom glow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
        </div>
      </GlassCard>
    </div>
  );
};

const MyBadges = () => {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!currentUser?.email) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${getBaseURL()}/skill-badges/applications`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const myBadges = res.data.filter(
          (app) =>
            app.user_email &&
            app.user_email.trim().toLowerCase() ===
              currentUser.email.trim().toLowerCase() &&
            app.status === "approved"
        );
        setBadges(myBadges);
      } catch {
        setBadges([]);
        setError("Failed to fetch badges. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [currentUser?.email]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-900 p-6">
      <div className="w-full max-w-5xl bg-neutral-900 shadow-2xl rounded-3xl p-8 border border-neutral-800">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold mb-2 text-neutral-100 tracking-tight drop-shadow">
            My Skill Badges
          </h2>
          <p className="text-neutral-300 text-lg">
            Showcasing your professional achievements
          </p>
        </div>
        {loading && (
          <p className="text-center text-lg font-medium text-neutral-200">
            Loading...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 font-semibold text-lg">
            {error}
          </p>
        )}
        {!loading && !error && badges.length === 0 && (
          <p className="text-center text-neutral-400 text-lg py-16">
            No approved badges found for your account.
          </p>
        )}
        {!loading && badges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {badges.map((badge, idx) => (
              <Badge3D key={idx} {...badge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBadges;