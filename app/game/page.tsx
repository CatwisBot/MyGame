"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pickaxe, Coins, TrendingUp, Clock, Trophy, Zap, Star, Target, Gift, Users, Gem, ShoppingCart, Flame, Shield, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface Rock {
  id: number;
  health: number;
  maxHealth: number;
  mineral: Mineral;
  revealed: boolean;
  isCritical?: boolean;
}

interface Mineral {
  name: string;
  value: number;
  color: string;
  rarity: number;
  emoji: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
  reward?: number;
}

interface Worker {
  id: number;
  name: string;
  cost: number;
  income: number;
  owned: number;
  emoji: string;
}

const minerals: Mineral[] = [
  { name: "Batu Biasa", value: 10, color: "#64748b", rarity: 50, emoji: "🪨" },
  { name: "Batu Kualitas Baik", value: 25, color: "#94a3b8", rarity: 30, emoji: "🗿" },
  { name: "Besi", value: 40, color: "#78716c", rarity: 20, emoji: "⚙️" },
  { name: "Perak", value: 75, color: "#e2e8f0", rarity: 15, emoji: "⚪" },
  { name: "Emas", value: 150, color: "#fbbf24", rarity: 10, emoji: "🟡" },
  { name: "Platinum", value: 300, color: "#d1d5db", rarity: 6, emoji: "⭐" },
  { name: "Ruby", value: 500, color: "#dc2626", rarity: 4, emoji: "🔴" },
  { name: "Emerald", value: 800, color: "#10b981", rarity: 2, emoji: "🟢" },
  { name: "Diamond", value: 1500, color: "#3b82f6", rarity: 1, emoji: "💎" },
  { name: "Obsidian", value: 3000, color: "#0f172a", rarity: 0.5, emoji: "⚫" },
];

const workers: Worker[] = [
  { id: 1, name: "Pekerja", cost: 100, income: 1, owned: 0, emoji: "👷" },
  { id: 2, name: "Ahli Tambang", cost: 500, income: 5, owned: 0, emoji: "⛏️" },
  { id: 3, name: "Insinyur", cost: 2000, income: 20, owned: 0, emoji: "👨‍🔧" },
  { id: 4, name: "Robot", cost: 10000, income: 100, owned: 0, emoji: "🤖" },
  { id: 5, name: "AI Miner", cost: 50000, income: 500, owned: 0, emoji: "🧠" },
];

export default function GamePage() {
  // Load saved data from localStorage
  const loadProgress = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('minerTycoonProgress');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const savedData = loadProgress();

  const [money, setMoney] = useState(savedData?.money || 0);
  const [totalEarned, setTotalEarned] = useState(savedData?.totalEarned || 0);
  const [totalClicks, setTotalClicks] = useState(savedData?.totalClicks || 0);
  const [rocksDestroyed, setRocksDestroyed] = useState(savedData?.rocksDestroyed || 0);
  const [rocks, setRocks] = useState<Rock[]>([]);
  const [nextRockId, setNextRockId] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"game" | "upgrades" | "workers" | "achievements">("game");
  
  // Sound control
  const [isMuted, setIsMuted] = useState(savedData?.isMuted || false);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  
  // New features
  const [criticalChance, setCriticalChance] = useState(savedData?.criticalChance || 5);
  const [criticalDamage, setCriticalDamage] = useState(savedData?.criticalDamage || 2);
  const [autoClickerLevel, setAutoClickerLevel] = useState(savedData?.autoClickerLevel || 0);
  const [luckBonus, setLuckBonus] = useState(savedData?.luckBonus || 0);
  const [maxRocks, setMaxRocks] = useState(savedData?.maxRocks || 9);
  const [dailyReward, setDailyReward] = useState(savedData?.dailyReward !== undefined ? savedData.dailyReward : true);
  const [prestigePoints, setPrestigePoints] = useState(savedData?.prestigePoints || 0);
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(savedData?.prestigeMultiplier || 1);
  
  // Workers
  const [workerList, setWorkerList] = useState<Worker[]>(savedData?.workerList || workers);
  const [passiveIncome, setPassiveIncome] = useState(0);

  const [achievements, setAchievements] = useState<Achievement[]>(savedData?.achievements || [
    { id: "first_rock", name: "Penambang Pemula", description: "Hancurkan batu pertama", unlocked: false, icon: "🎯", reward: 50 },
    { id: "rich", name: "Kaya Raya", description: "Kumpulkan $5000", unlocked: false, icon: "💰", reward: 500 },
    { id: "very_rich", name: "Sultan", description: "Kumpulkan $50000", unlocked: false, icon: "👑", reward: 5000 },
    { id: "clicker", name: "Master Clicker", description: "Klik 1000 kali", unlocked: false, icon: "👆", reward: 200 },
    { id: "destroyer", name: "Perusak Batu", description: "Hancurkan 100 batu", unlocked: false, icon: "💥", reward: 300 },
    { id: "lucky", name: "Keberuntungan", description: "Dapatkan Diamond", unlocked: false, icon: "💎", reward: 1000 },
    { id: "obsidian", name: "Langka!", description: "Dapatkan Obsidian", unlocked: false, icon: "⚫", reward: 3000 },
    { id: "combo_master", name: "Combo Master", description: "Capai combo 20x", unlocked: false, icon: "⚡", reward: 800 },
    { id: "first_worker", name: "Boss", description: "Hire worker pertama", unlocked: false, icon: "👷", reward: 100 },
    { id: "rich_boss", name: "Tycoon", description: "Hire 10 workers total", unlocked: false, icon: "🏢", reward: 2000 },
  ]);

  // Sound effect functions using Web Audio API
  const playClickSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(sfxVolume * 0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      // Clean up
      setTimeout(() => audioContext.close(), 200);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const playBreakSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(sfxVolume * 0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      setTimeout(() => audioContext.close(), 300);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const playCoinSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1500, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(sfxVolume * 0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
      
      setTimeout(() => audioContext.close(), 250);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const playUpgradeSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(sfxVolume * 0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      setTimeout(() => audioContext.close(), 400);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const playAchievementSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new AudioContext();
      
      // Multi-tone fanfare
      [800, 1000, 1200, 1500].forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
        gainNode.gain.setValueAtTime(sfxVolume * 0.15, audioContext.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
      
      setTimeout(() => audioContext.close(), 800);
    } catch (e) {
      console.log('Audio not available');
    }
  };
  
  // Upgrades
  const [clickPower, setClickPower] = useState(savedData?.clickPower || 1);
  const [clickPowerLevel, setClickPowerLevel] = useState(savedData?.clickPowerLevel || 1);
  const [valueMultiplier, setValueMultiplier] = useState(savedData?.valueMultiplier || 1);
  const [valueMultiplierLevel, setValueMultiplierLevel] = useState(savedData?.valueMultiplierLevel || 1);
  const [spawnRate, setSpawnRate] = useState(savedData?.spawnRate || 5000);
  const [spawnRateLevel, setSpawnRateLevel] = useState(savedData?.spawnRateLevel || 1);

  // Upgrade costs
  const clickPowerCost = Math.floor(100 * Math.pow(1.5, clickPowerLevel - 1));
  const valueMultiplierCost = Math.floor(200 * Math.pow(1.6, valueMultiplierLevel - 1));
  const spawnRateCost = Math.floor(150 * Math.pow(1.5, spawnRateLevel - 1));
  const criticalChanceCost = Math.floor(300 * Math.pow(2, Math.floor(criticalChance / 5)));
  const criticalDamageCost = Math.floor(500 * Math.pow(2, criticalDamage - 2));
  const autoClickerCost = Math.floor(1000 * Math.pow(2.5, autoClickerLevel));
  const luckBonusCost = Math.floor(800 * Math.pow(2, luckBonus));
  const maxRocksCost = Math.floor(2000 * Math.pow(3, maxRocks - 9));

  const getRandomMineral = (): Mineral => {
    const totalRarity = minerals.reduce((sum, m) => sum + m.rarity * (1 + luckBonus * 0.1), 0);
    let random = Math.random() * totalRarity;
    
    // Luck bonus increases chance for rare minerals
    const adjustedMinerals = minerals.map(m => ({
      ...m,
      adjustedRarity: m.rarity < 10 ? m.rarity * (1 + luckBonus * 0.2) : m.rarity
    }));
    
    for (const mineral of adjustedMinerals) {
      random -= mineral.adjustedRarity;
      if (random <= 0) return mineral;
    }
    return minerals[0];
  };

  const spawnRock = () => {
    if (rocks.length < maxRocks) {
      const mineral = getRandomMineral();
      const isCritical = Math.random() * 100 < criticalChance;
      const newRock: Rock = {
        id: nextRockId,
        health: 20,
        maxHealth: 20,
        mineral,
        revealed: false,
        isCritical,
      };
      setRocks((prev: Rock[]) => [...prev, newRock]);
      setNextRockId((prev: number) => prev + 1);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const checkAchievement = (id: string) => {
    setAchievements((prev: Achievement[]) => {
      const achievement = prev.find((a) => a.id === id);
      if (achievement && !achievement.unlocked) {
        const reward = achievement.reward || 0;
        setMoney((m: number) => m + reward);
        showNotification(`🏆 ${achievement.name}! +$${reward}`);
        playAchievementSound();
        return prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a));
      }
      return prev;
    });
  };

  const clickRock = (rockId: number) => {
    setTotalClicks((c: number) => c + 1);
    playClickSound();
    
    // Combo system
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      setComboCount((c: number) => c + 1);
      setShowCombo(true);
    } else {
      setComboCount(1);
    }
    setLastClickTime(now);

    setRocks((prev: Rock[]) => {
      return prev
        .map((rock) => {
          if (rock.id === rockId) {
            // Critical hit check
            const isCrit = Math.random() * 100 < criticalChance;
            const damage = isCrit ? clickPower * criticalDamage : clickPower;
            
            if (isCrit) {
              showNotification(`💥 Critical Hit! ${damage} damage!`);
            }
            
            const newHealth = rock.health - damage;
            const newRock = { ...rock, health: newHealth, revealed: true };
            
            if (newHealth <= 0) {
              // Rock destroyed
              playBreakSound();
              playCoinSound();
              
              const comboBonus = Math.floor(comboCount / 5);
              const critBonus = rock.isCritical ? 2 : 1;
              const prestigeBonus = prestigeMultiplier;
              const finalValue = Math.floor(
                rock.mineral.value * 
                valueMultiplier * 
                (1 + comboBonus * 0.1) * 
                critBonus * 
                prestigeBonus
              );
              
              setMoney((m: number) => m + finalValue);
              setTotalEarned((t: number) => t + finalValue);
              setRocksDestroyed((r: number) => r + 1);
              
              // Check achievements
              if (rocksDestroyed === 0) checkAchievement("first_rock");
              if (rock.mineral.name === "Diamond") checkAchievement("lucky");
              if (rock.mineral.name === "Obsidian") checkAchievement("obsidian");
              
              return null;
            }
            return newRock;
          }
          return rock;
        })
        .filter((rock) => rock !== null) as Rock[];
    });
  };

  const upgradeClickPower = () => {
    if (money >= clickPowerCost) {
      setMoney((m: number) => m - clickPowerCost);
      setClickPower((p: number) => p + 1);
      setClickPowerLevel((l: number) => l + 1);
      playUpgradeSound();
    }
  };

  const upgradeValueMultiplier = () => {
    if (money >= valueMultiplierCost) {
      setMoney((m: number) => m - valueMultiplierCost);
      setValueMultiplier((v: number) => v + 0.5);
      setValueMultiplierLevel((l: number) => l + 1);
      playUpgradeSound();
    }
  };

  const upgradeSpawnRate = () => {
    if (money >= spawnRateCost && spawnRate > 1000) {
      setMoney((m: number) => m - spawnRateCost);
      setSpawnRate((r: number) => Math.max(1000, r - 500));
      setSpawnRateLevel((l: number) => l + 1);
      playUpgradeSound();
    }
  };

  const upgradeCriticalChance = () => {
    if (money >= criticalChanceCost && criticalChance < 50) {
      setMoney((m: number) => m - criticalChanceCost);
      setCriticalChance((c: number) => c + 5);
      playUpgradeSound();
    }
  };

  const upgradeCriticalDamage = () => {
    if (money >= criticalDamageCost && criticalDamage < 10) {
      setMoney((m: number) => m - criticalDamageCost);
      setCriticalDamage((d: number) => d + 1);
      playUpgradeSound();
    }
  };

  const upgradeAutoClicker = () => {
    if (money >= autoClickerCost) {
      setMoney((m: number) => m - autoClickerCost);
      setAutoClickerLevel((l: number) => l + 1);
      playUpgradeSound();
    }
  };

  const upgradeLuckBonus = () => {
    if (money >= luckBonusCost && luckBonus < 10) {
      setMoney((m: number) => m - luckBonusCost);
      setLuckBonus((l: number) => l + 1);
      playUpgradeSound();
    }
  };

  const upgradeMaxRocks = () => {
    if (money >= maxRocksCost && maxRocks < 15) {
      setMoney((m: number) => m - maxRocksCost);
      setMaxRocks((r: number) => r + 3);
      playUpgradeSound();
    }
  };

  const hireWorker = (workerId: number) => {
    const worker = workerList.find((w) => w.id === workerId);
    if (!worker) return;
    
    const cost = Math.floor(worker.cost * Math.pow(1.15, worker.owned));
    if (money >= cost) {
      setMoney((m: number) => m - cost);
      setWorkerList((prev: Worker[]) =>
        prev.map((w) =>
          w.id === workerId ? { ...w, owned: w.owned + 1 } : w
        )
      );
      playUpgradeSound();
      
      const totalWorkers = workerList.reduce((sum, w) => sum + w.owned, 0);
      if (totalWorkers === 0) checkAchievement("first_worker");
      if (totalWorkers >= 9) checkAchievement("rich_boss");
    }
  };

  const claimDailyReward = () => {
    if (dailyReward) {
      const reward = 500 + rocksDestroyed * 10;
      setMoney((m: number) => m + reward);
      showNotification(`🎁 Daily Reward: $${reward}!`);
      playCoinSound();
      setDailyReward(false);
    }
  };

  const resetProgress = () => {
    if (confirm('Yakin ingin reset semua progress? Ini tidak bisa dibatalkan!')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('minerTycoonProgress');
        window.location.reload();
      }
    }
  };

  // Auto spawn rocks
  useEffect(() => {
    const interval = setInterval(() => {
      setRocks((currentRocks: Rock[]) => {
        if (currentRocks.length < maxRocks) {
          const mineral = getRandomMineral();
          const isCritical = Math.random() * 100 < criticalChance;
          const newRock: Rock = {
            id: Date.now() + Math.random(), // Use timestamp + random for unique ID
            health: 20,
            maxHealth: 20,
            mineral,
            revealed: false,
            isCritical,
          };
          return [...currentRocks, newRock];
        }
        return currentRocks;
      });
    }, spawnRate);
    return () => clearInterval(interval);
  }, [spawnRate, maxRocks, criticalChance]);

  // Auto clicker
  useEffect(() => {
    if (autoClickerLevel > 0 && rocks.length > 0) {
      const interval = setInterval(() => {
        setRocks((currentRocks: Rock[]) => {
          if (currentRocks.length === 0) return currentRocks;
          
          // Pick random rock
          const randomIndex = Math.floor(Math.random() * currentRocks.length);
          const randomRock = currentRocks[randomIndex];
          
          // Auto click logic (simplified, no combo)
          const isCrit = Math.random() * 100 < criticalChance;
          const damage = isCrit ? clickPower * criticalDamage : clickPower;
          
          return currentRocks
            .map((rock, index) => {
              if (index === randomIndex) {
                const newHealth = rock.health - damage;
                const newRock = { ...rock, health: newHealth, revealed: true };
                
                if (newHealth <= 0) {
                  // Rock destroyed by auto clicker
                  const critBonus = rock.isCritical ? 2 : 1;
                  const finalValue = Math.floor(
                    rock.mineral.value * 
                    valueMultiplier * 
                    critBonus * 
                    prestigeMultiplier
                  );
                  
                  setMoney((m: number) => m + finalValue);
                  setTotalEarned((t: number) => t + finalValue);
                  setRocksDestroyed((r: number) => r + 1);
                  
                  return null;
                }
                return newRock;
              }
              return rock;
            })
            .filter((rock) => rock !== null) as Rock[];
        });
      }, 1000 / autoClickerLevel);
      return () => clearInterval(interval);
    }
  }, [autoClickerLevel, rocks.length, clickPower, criticalChance, criticalDamage, valueMultiplier, prestigeMultiplier]);

  // Passive income from workers
  useEffect(() => {
    const totalIncome = workerList.reduce((sum, w) => sum + w.income * w.owned, 0);
    setPassiveIncome(totalIncome);
    
    if (totalIncome > 0) {
      const interval = setInterval(() => {
        setMoney((m: number) => m + totalIncome);
        setTotalEarned((t: number) => t + totalIncome);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [workerList]);

  // Check achievements
  useEffect(() => {
    if (totalEarned >= 5000) checkAchievement("rich");
    if (totalEarned >= 50000) checkAchievement("very_rich");
    if (totalClicks >= 1000) checkAchievement("clicker");
    if (rocksDestroyed >= 100) checkAchievement("destroyer");
    if (comboCount >= 20) checkAchievement("combo_master");
  }, [totalEarned, totalClicks, comboCount, rocksDestroyed]);

  // Hide combo after inactivity
  useEffect(() => {
    if (comboCount > 1) {
      const timeout = setTimeout(() => {
        setShowCombo(false);
        setComboCount(0);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [lastClickTime, comboCount]);

  // Auto-save progress to localStorage
  useEffect(() => {
    const saveProgress = () => {
      const progressData = {
        money,
        totalEarned,
        totalClicks,
        rocksDestroyed,
        clickPower,
        clickPowerLevel,
        valueMultiplier,
        valueMultiplierLevel,
        spawnRate,
        spawnRateLevel,
        criticalChance,
        criticalDamage,
        autoClickerLevel,
        luckBonus,
        maxRocks,
        dailyReward,
        prestigePoints,
        prestigeMultiplier,
        workerList,
        achievements,
        isMuted,
        lastSaved: new Date().toISOString(),
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('minerTycoonProgress', JSON.stringify(progressData));
      }
    };

    // Save every 5 seconds
    const saveInterval = setInterval(saveProgress, 5000);
    
    // Also save on unmount
    return () => {
      clearInterval(saveInterval);
      saveProgress();
    };
  }, [
    money, totalEarned, totalClicks, rocksDestroyed,
    clickPower, clickPowerLevel, valueMultiplier, valueMultiplierLevel,
    spawnRate, spawnRateLevel, criticalChance, criticalDamage,
    autoClickerLevel, luckBonus, maxRocks, dailyReward,
    prestigePoints, prestigeMultiplier, workerList, achievements, isMuted
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-linear-to-br from-gray-900 via-slate-800 to-gray-700 px-4 py-6 relative">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {notification}
        </div>
      )}

      {/* Combo Counter */}
      {showCombo && comboCount > 1 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-yellow-500 text-white px-6 py-2 rounded-full shadow-lg font-bold text-xl flex items-center gap-2">
            <Zap size={20} /> COMBO {comboCount}x
          </div>
        </div>
      )}

      {/* Daily Reward */}
      {dailyReward && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={claimDailyReward}
            className="bg-linear-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold flex items-center gap-2 animate-pulse"
          >
            <Gift size={20} /> Claim Daily Reward!
          </button>
        </div>
      )}

      {/* Sound Control */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <button
          onClick={resetProgress}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition"
          title="Reset Progress"
        >
          <RotateCcw size={24} />
        </button>
      </div>

  <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-4 text-center">Simple Tap Miner</h2>
      
      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-2 mb-4 w-full max-w-md">
        <div className="bg-slate-900/80 rounded-xl p-3 shadow-lg border border-slate-700">
          <div className="flex items-center justify-center gap-2">
            <Coins className="text-yellow-400" size={20} />
            <div>
              <div className="text-xs text-gray-400">Uang</div>
              <div className="text-lg font-bold text-yellow-400">${money.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/80 rounded-xl p-3 shadow-lg border border-slate-700">
          <div className="flex items-center justify-center gap-2">
            <Target className="text-blue-400" size={20} />
            <div>
              <div className="text-xs text-gray-400">Batu</div>
              <div className="text-lg font-bold text-blue-400">{rocksDestroyed}</div>
            </div>
          </div>
        </div>
      </div>

      {passiveIncome > 0 && (
        <div className="bg-green-900/80 rounded-xl p-2 mb-4 w-full max-w-md shadow-lg border border-green-700">
          <div className="text-center text-sm text-green-300 flex items-center justify-center gap-2">
            <Users size={16} /> Passive Income: <span className="font-bold">+${passiveIncome}/s</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 w-full max-w-md overflow-x-auto">
        <button
          onClick={() => setCurrentTab("game")}
          className={`px-4 py-2 rounded-lg font-semibold transition flex-1 ${
            currentTab === "game" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300"
          }`}
        >
          <Pickaxe size={16} className="inline mr-1" /> Game
        </button>
        <button
          onClick={() => setCurrentTab("upgrades")}
          className={`px-4 py-2 rounded-lg font-semibold transition flex-1 ${
            currentTab === "upgrades" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300"
          }`}
        >
          <TrendingUp size={16} className="inline mr-1" /> Upgrades
        </button>
        <button
          onClick={() => setCurrentTab("workers")}
          className={`px-4 py-2 rounded-lg font-semibold transition flex-1 ${
            currentTab === "workers" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300"
          }`}
        >
          <Users size={16} className="inline mr-1" /> Workers
        </button>
        <button
          onClick={() => setCurrentTab("achievements")}
          className={`px-4 py-2 rounded-lg font-semibold transition flex-1 ${
            currentTab === "achievements" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300"
          }`}
        >
          <Trophy size={16} className="inline mr-1" /> Rewards
        </button>
      </div>

      {/* Game Tab */}
      {currentTab === "game" && (
        <div className="bg-slate-900/80 rounded-xl p-4 mb-4 w-full max-w-md shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-3 text-center flex items-center justify-center gap-2">
            <Pickaxe size={20} className="text-yellow-400" />
            Klik Batu untuk Menambang!
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {rocks.map((rock) => (
              <button
                key={rock.id}
                onClick={() => clickRock(rock.id)}
                className={`relative aspect-square rounded-lg border-2 transition-all active:scale-95 hover:shadow-lg ${
                  rock.isCritical
                    ? "border-yellow-400 shadow-yellow-400/50 animate-pulse"
                    : "border-slate-600 hover:border-yellow-400 hover:shadow-yellow-400/50"
                }`}
                style={{ backgroundColor: rock.revealed ? rock.mineral.color : "#475569" }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  {rock.revealed ? (
                    <>
                      <div className="text-2xl mb-1">{rock.mineral.emoji}</div>
                      <div className="text-xs font-semibold">{rock.mineral.name}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl">🪨</div>
                      <div className="text-xs mt-1">???</div>
                    </>
                  )}
                  <div className="text-sm font-bold mt-1">{rock.health}/{rock.maxHealth}</div>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black/40 transition-all rounded-b-md"
                  style={{ height: `${(rock.health / rock.maxHealth) * 100}%` }}
                />
                {rock.revealed && (
                  <div className="absolute top-1 right-1 bg-yellow-400 text-xs px-1 rounded text-black font-bold">
                    ${Math.floor(rock.mineral.value * valueMultiplier)}
                  </div>
                )}
                {rock.isCritical && (
                  <div className="absolute top-1 left-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </button>
            ))}
            {[...Array(maxRocks - rocks.length)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-600">
                <Clock size={20} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrades Tab */}
      {currentTab === "upgrades" && (
        <div className="bg-slate-900/80 rounded-xl p-4 mb-4 w-full max-w-md shadow-lg border border-slate-700 max-h-[500px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" /> All Upgrades
          </h3>
          <div className="space-y-2">
            <button
              onClick={upgradeClickPower}
              disabled={money < clickPowerCost}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pickaxe size={16} /> Click Power +{clickPower}
                </span>
                <span>${clickPowerCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">Level {clickPowerLevel} → {clickPowerLevel + 1}</div>
            </button>

            <button
              onClick={upgradeValueMultiplier}
              disabled={money < valueMultiplierCost}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coins size={16} /> Value x{valueMultiplier.toFixed(1)}
                </span>
                <span>${valueMultiplierCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">Level {valueMultiplierLevel}</div>
            </button>

            <button
              onClick={upgradeSpawnRate}
              disabled={money < spawnRateCost || spawnRate <= 1000}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock size={16} /> Spawn {(spawnRate/1000).toFixed(1)}s
                </span>
                <span>${spawnRateCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">Level {spawnRateLevel}</div>
            </button>

            <button
              onClick={upgradeCriticalChance}
              disabled={money < criticalChanceCost || criticalChance >= 50}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap size={16} /> Crit Chance {criticalChance}%
                </span>
                <span>${criticalChanceCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">+5% per upgrade (Max 50%)</div>
            </button>

            <button
              onClick={upgradeCriticalDamage}
              disabled={money < criticalDamageCost || criticalDamage >= 10}
              className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Flame size={16} /> Crit Damage x{criticalDamage}
                </span>
                <span>${criticalDamageCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">+1x per upgrade (Max 10x)</div>
            </button>

            <button
              onClick={upgradeAutoClicker}
              disabled={money < autoClickerCost}
              className="w-full bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target size={16} /> Auto Clicker Lv.{autoClickerLevel}
                </span>
                <span>${autoClickerCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">{autoClickerLevel > 0 ? `${autoClickerLevel} clicks/sec` : "Buy to enable"}</div>
            </button>

            <button
              onClick={upgradeLuckBonus}
              disabled={money < luckBonusCost || luckBonus >= 10}
              className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star size={16} /> Luck Bonus +{luckBonus}
                </span>
                <span>${luckBonusCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">Better rare mineral chance (Max 10)</div>
            </button>

            <button
              onClick={upgradeMaxRocks}
              disabled={money < maxRocksCost || maxRocks >= 15}
              className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Gem size={16} /> Max Rocks: {maxRocks}
                </span>
                <span>${maxRocksCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-left mt-1 opacity-75">+3 slots per upgrade (Max 15)</div>
            </button>
          </div>
        </div>
      )}

      {/* Workers Tab */}
      {currentTab === "workers" && (
        <div className="bg-slate-900/80 rounded-xl p-4 mb-4 w-full max-w-md shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Users size={20} className="text-green-400" /> Hire Workers
          </h3>
          <div className="space-y-2">
            {workerList.map((worker) => {
              const cost = Math.floor(worker.cost * Math.pow(1.15, worker.owned));
              return (
                <button
                  key={worker.id}
                  onClick={() => hireWorker(worker.id)}
                  disabled={money < cost}
                  className="w-full bg-green-700 hover:bg-green-800 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{worker.emoji}</span> {worker.name} ({worker.owned})
                    </span>
                    <span>${cost.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-left mt-1 opacity-75">
                    +${worker.income}/s each • Total: +${worker.income * worker.owned}/s
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {currentTab === "achievements" && (
        <div className="bg-slate-900/80 rounded-xl p-4 mb-4 w-full max-w-md shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" /> Achievements
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border-2 ${
                  achievement.unlocked
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-slate-700 bg-slate-800/50 opacity-50"
                }`}
              >
                <div className="text-2xl text-center mb-1">{achievement.icon}</div>
                <div className="text-xs font-semibold text-center text-gray-200">{achievement.name}</div>
                <div className="text-xs text-center text-gray-400 mb-1">{achievement.description}</div>
                {achievement.reward && (
                  <div className="text-xs text-center text-yellow-400 font-bold">
                    {achievement.unlocked ? "Claimed!" : `Reward: $${achievement.reward}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center mb-2">
        Total Earned: ${totalEarned} | Clicks: {totalClicks}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Kembali ke <a href="/" className="underline text-blue-400">Splash Screen</a>
      </div>
    </div>
  );
}
