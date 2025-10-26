import React from "react";
import { Pickaxe, Building2, Gem, Globe2 } from "lucide-react";

export default function SplashScreen() {
  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-900 via-slate-800 to-gray-700 relative px-4 py-6 sm:px-8">
      {/* Animated pickaxe */}
      <div className="relative mb-8">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-swing origin-[60px_100px]"
        >
          <rect x="55" y="30" width="10" height="60" rx="5" fill="#a16207" />
          <path
            d="M60 30 Q80 10 100 30 Q80 20 60 30 Q40 20 20 30 Q40 10 60 30"
            stroke="#fbbf24"
            strokeWidth="8"
            fill="none"
          />
        </svg>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-100 drop-shadow-[0_4px_24px_#334155] mb-2 z-10 text-center">
        Miner Tycoon
      </h1>
      <p className="text-base sm:text-xl text-blue-300 font-semibold mb-4 drop-shadow-[0_2px_8px_#334155] z-10 text-center">
        Klik untuk menjadi raja tambang!
      </p>
      <div className="bg-slate-900/80 rounded-xl p-4 sm:p-6 mb-6 max-w-md w-full z-10 backdrop-blur-md shadow-lg border border-slate-700">
        <ul className="text-sm sm:text-base text-gray-200 space-y-2">
          <li className="flex items-center gap-2"><Pickaxe size={18} className="text-blue-400" /> Kumpulkan koin dengan klik pada layar</li>
          <li className="flex items-center gap-2"><Building2 size={18} className="text-blue-400" /> Upgrade alat tambang untuk pendapatan lebih besar</li>
          <li className="flex items-center gap-2"><Gem size={18} className="text-blue-400" /> Temukan mineral langka dan capai level tertinggi</li>
        </ul>
        <div className="mt-4 text-xs sm:text-sm text-gray-400 text-center">Game idle clicker, cocok dimainkan kapan saja!</div>
        <a href="/game" className="block mt-6 text-center">
          <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow transition w-full max-w-xs mx-auto">
            Masuk ke Game
          </button>
        </a>
      </div>
  <div className="text-xs text-gray-400 mb-2 z-10 text-center">Versi Alpha • Progress & fitur akan terus bertambah!</div>
  <div className="text-xs text-gray-500 mb-2 z-10 text-center">Dibuat oleh <span className="font-bold text-blue-400">Catwis Dev</span></div>
      {/* Animated floating coins */}
  <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none">
        {[...Array(8)].map((_, i) => {
          // Random position and animation delay for each coin
          const left = `${10 + Math.random() * 80}%`;
          const top = `${10 + Math.random() * 80}%`;
          return (
            <svg
              key={i}
              width="28"
              height="28"
              viewBox="0 0 32 32"
              className="absolute z-0"
              style={{ left, top, animation: `float${i} 3s ${i * 0.3}s infinite alternate` }}
            >
              <circle cx="16" cy="16" r="14" fill="#334155" stroke="#64748b" strokeWidth="3" />
              <text x="16" y="21" textAnchor="middle" fontSize="14" fill="#60a5fa" fontWeight="bold">$</text>
            </svg>
          );
        })}
      </div>
      {/* Custom keyframes for swing and float animation */}
      <style>{`
				@keyframes swing {
					0% { transform: rotate(-15deg); }
					100% { transform: rotate(15deg); }
				}
				.animate-swing {
					animation: swing 1.2s infinite alternate;
				}
				${[...Array(8)]
          .map(
            (_, i) => `@keyframes float${i} {
					0% { transform: translateY(0px) scale(1); opacity: 0.7; }
					100% { transform: translateY(-30px) scale(1.1); opacity: 1; }
				}`
          )
          .join("\n")}
			`}</style>
    </div>
  );
}
