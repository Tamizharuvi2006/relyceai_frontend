import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { updateUserMembership } from '../services/membershipService';
import { getCurrentPricing } from '../../admin/services/adminDashboard';
import { validateCoupon, getAllCoupons } from '../../../utils/couponManagement';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import {
  Star,
  Zap,
  Crown,
  Shield,
  Check,
  Award,
  Sparkles
} from 'lucide-react';

// === Cyberpunk Rain Effect (copied from HowItWorksSection for consistency) ===
const CyberpunkRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let w = canvas.width;
    let h = canvas.height;
    let lines = [];
    let animationFrameId;

    const LINE_SPACING = 70;
    const DROP_COUNT = 6;
    const COLORS = [
      [0, 255, 180],
      [0, 200, 255],
      [0, 255, 100],
      [100, 255, 200],
      [255, 50, 150],
    ];

    const initLines = () => {
      lines = [];
      const numLines = Math.floor(w / LINE_SPACING);
      for (let i = 0; i < numLines; i++) {
        const depth = 0.4 + Math.random() * 0.6;
        const drops = [];
        for (let j = 0; j < DROP_COUNT; j++) {
          drops.push({
            y: Math.random() * h,
            speed: 1 + Math.random() * 4 * depth,
            height: 10 + Math.random() * 20,
            opacity: 0.3 + Math.random() * 0.7,
            tailLength: 15 + Math.random() * 25,
            swayOffset: Math.random() * 1000,
            swayAmplitude: 2 + Math.random() * 3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: (Math.random() - 0.5) * 0.2,
            flickerPhase: Math.random() * Math.PI * 2,
            sparkTimer: 0,
          });
        }
        lines.push({
          x: i * LINE_SPACING + (Math.random() * 20 - 10),
          drops,
          depth,
          swayOffset: Math.random() * 50,
        });
      }
    };
    initLines();

    const animate = () => {
      const time = Date.now() * 0.002;
      ctx.fillStyle = "rgba(5,6,10,0.15)";
      ctx.fillRect(0, 0, w, h);

      if (canvas.width !== w || canvas.height !== h) {
        w = canvas.width;
        h = canvas.height;
        initLines();
      }

      for (let line of lines) {
        const lineSway = Math.sin(time + line.swayOffset) * 8 * line.depth;
        const lineAlpha = 0.15 + 0.25 * line.depth;

        ctx.fillStyle = `rgba(20,20,30,${lineAlpha})`;
        ctx.fillRect(line.x - 1.5 + lineSway, 0, 3, h);

        ctx.shadowBlur = 12 * line.depth;
        ctx.shadowColor = "#0f0";

        for (let drop of line.drops) {
          const dropSway = Math.sin(time * 1.5 + drop.swayOffset) * drop.swayAmplitude;
          const flicker = 0.4 + 0.6 * Math.sin(time * 6 + drop.flickerPhase);

          if (drop.sparkTimer > 0) drop.sparkTimer--;
          else if (Math.random() < 0.015) drop.sparkTimer = 3;

          const sparkMultiplier = drop.sparkTimer > 0 ? 2 : 1;
          const dropX = line.x + lineSway + dropSway;

          ctx.save();
          ctx.translate(dropX, drop.y);
          ctx.rotate(drop.rotation);

          const gradient = ctx.createLinearGradient(0, -drop.tailLength / 2, 0, drop.tailLength / 2);
          gradient.addColorStop(0, "rgba(0,0,0,0)");
          gradient.addColorStop(
            1,
            `rgba(${drop.color[0]},${drop.color[1]},${drop.color[2]},${drop.opacity * flicker * lineAlpha * sparkMultiplier
            })`
          );

          ctx.fillStyle = gradient;
          ctx.fillRect(-2, -drop.tailLength / 2, 4, drop.tailLength);
          ctx.restore();

          drop.y += drop.speed;
          if (drop.y - drop.tailLength / 2 > h) drop.y = -drop.tailLength / 2;
        }
        ctx.shadowBlur = 0;
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    />
  );
};

// Loading Skeleton matching site theme
const LoadingSkeleton = () => (
  <div className="p-6 rounded-2xl bg-black/20 shadow-lg border border-emerald-500/20 animate-pulse">
    <div className="h-16 w-16 mx-auto rounded-full bg-gray-800 mb-6"></div>
    <div className="h-6 bg-gray-800 rounded w-3/4 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-6"></div>
    <div className="h-10 bg-gray-800 rounded w-1/3 mx-auto mb-8"></div>
    <div className="space-y-3 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-800 rounded"></div>
      ))}
    </div>
    <div className="h-12 bg-gray-800 rounded"></div>
  </div>
);

// Floating Sparkle/Diamond Component
const FloatingSparkle = ({ delay, duration, left }) => (
  <div
    className="absolute pointer-events-none animate-float-coin"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    <div className="text-emerald-400/30 text-xl">✦</div>
  </div>
);

// Confetti Burst Component
const ConfettiBurst = ({ isActive, planId }) => {
  if (!isActive) return null;
  const colors = ['bg-pink-400', 'bg-purple-400', 'bg-cyan-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-orange-400'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 ${colors[i % colors.length]} rounded-full animate-confetti`}
          style={{
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: '50%',
            animationDelay: `${i * 0.05}s`,
            '--tx': `${(Math.random() - 0.5) * 100}px`,
            '--ty': `${-50 - Math.random() * 100}px`,
          }}
        />
      ))}
    </div>
  );
};

// Click Spark Effect
const ClickSpark = ({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x - 30, top: y - 30 }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-spark"
          style={{
            transform: `rotate(${i * 60}deg)`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function Membership() {
  const { currentUser: user, membership, refreshUserProfile } = useAuth();

  const [tab, setTab] = useState('personal');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(null);
  const [plansData, setPlansData] = useState({ personal: [], business: [] });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  // Easter Egg State
  const [easterEggs, setEasterEggs] = useState({});
  const [headerSparkle, setHeaderSparkle] = useState(false);
  const [confettiPlan, setConfettiPlan] = useState(null);
  const [clickSparks, setClickSparks] = useState([]);
  const [secretClicks, setSecretClicks] = useState(0);
  const [showSecretDeal, setShowSecretDeal] = useState(false);

  const easterEggColors = [
    'text-pink-400', 'text-purple-400', 'text-cyan-400', 'text-yellow-400',
    'text-orange-400', 'text-rose-400', 'text-indigo-400', 'text-teal-400',
  ];

  const handleEasterEgg = (id) => {
    const randomColor = easterEggColors[Math.floor(Math.random() * easterEggColors.length)];
    setEasterEggs(prev => ({ ...prev, [id]: randomColor }));
    setConfettiPlan(id); // Trigger confetti
  };

  const resetEasterEgg = (id) => {
    setEasterEggs(prev => ({ ...prev, [id]: null }));
    setConfettiPlan(null);
  };

  // Secret deal on 7 clicks
  const handleSecretClick = () => {
    setSecretClicks(prev => prev + 1);
    if (secretClicks >= 6) {
      setShowSecretDeal(true);
      toast('🎉 You found a secret discount! Use code: EASTER50', { icon: '💰', duration: 5000 });
      setTimeout(() => setShowSecretDeal(false), 5000);
      setSecretClicks(0);
    }
  };

  // Click spark effect on page
  const handlePageClick = (e) => {
    if (Math.random() > 0.75) { // 25% chance
      const id = Date.now();
      setClickSparks(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    }
  };

  const removeSpark = (id) => {
    setClickSparks(prev => prev.filter(s => s.id !== id));
  };

  // Fetch current pricing from Firestore
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const pricing = await getCurrentPricing();
        const personalPlans = [
          { id: 'free', title: 'Free', subtitle: 'Perfect to get started', monthlyPrice: pricing.free?.monthly || 0, yearlyPrice: pricing.free?.yearly || 0, features: ['Generic AI chatbot', 'Limited business chatbot', 'Basic data visualization', '15 chats per month', '30-day chat history', 'Community support'], icon: Star, popular: false },
          { id: 'starter', title: 'Starter', subtitle: 'For students and learners', monthlyPrice: pricing.starter?.monthly || 199, yearlyPrice: pricing.starter?.yearly || 1999, features: ['Generic + Business chatbot', 'Interactive visualization', '150 chats per month', '60-day chat history', 'Export chat history', 'Priority support'], icon: Zap, popular: true },
          { id: 'plus', title: 'Plus', subtitle: 'For power users', monthlyPrice: pricing.plus?.monthly || 499, yearlyPrice: pricing.plus?.yearly || 4999, features: ['Advanced business workflows', 'Enhanced data visualization', '600 chats per month', 'File upload (50 files, 100MB)', 'Premium support', 'Export reports & charts'], icon: Crown, popular: false },
          { id: 'pro', title: 'Pro', subtitle: 'For teams & SMEs', monthlyPrice: pricing.pro?.monthly || 1499, yearlyPrice: pricing.pro?.yearly || 14999, features: ['Team collaboration (5 users)', 'Advanced analytics', 'Custom branding', 'API access', '1,500 chats per month', 'Priority technical support'], icon: Award, popular: false },
        ];
        const businessPlans = [
          { id: 'business', title: 'Business', subtitle: 'For enterprises', monthlyPrice: pricing.business?.monthly || 4999, yearlyPrice: pricing.business?.yearly || 49999, features: ['Unlimited chats', 'Unlimited file uploads', 'Dedicated support manager', 'Team management', 'Advanced security', 'SLA guarantee'], icon: Shield, popular: false },
        ];
        setPlansData({ personal: personalPlans, business: businessPlans });
      } catch (error) { console.error('Error fetching pricing:', error); }
      finally { setTimeout(() => setLoading(false), 300); }
    };
    fetchPricing();
  }, []);

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => { try { const coupons = await getAllCoupons(); setAvailableCoupons(coupons.filter(c => c.active)); } catch (e) { console.error(e); } };
    fetchCoupons();
  }, []);

  // Coupon Logic
  const [couponSparkle, setCouponSparkle] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code'); return; }
    try {
      const coupon = await validateCoupon(couponCode);
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponError('');
        setCouponSparkle(true); // Trigger sparkle effect
        setTimeout(() => setCouponSparkle(false), 2000);
        toast.success(`Coupon applied: ${coupon.description}`);
      }
      else { setCouponError('Invalid coupon code'); setAppliedCoupon(null); }
    } catch (error) { console.error(error); setCouponError('Error validating coupon.'); }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    setShowAvailableCoupons(false); // Also close the panel
  };

  const closeCouponPanel = () => {
    if (!appliedCoupon) {
      setCouponCode('');
      setCouponError('');
    }
    setShowAvailableCoupons(false);
  };

  // Price Calculations
  const calculateFinalPrice = (plan) => {
    if (plan.monthlyPrice === 0) return 0;
    let price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    if (appliedCoupon) {
      const discount = billingCycle === 'yearly' ? (appliedCoupon.yearlyDiscount || appliedCoupon.monthlyDiscount || 0) : (appliedCoupon.monthlyDiscount || 0);
      if (appliedCoupon.type === 'percentage') { price = price * (1 - discount / 100); }
      else { price = Math.max(0, price - discount); }
    }
    return Math.round(price);
  };

  const handlePurchase = async (planId) => {
    if (!user) { toast.error('Please log in to choose a plan.'); return; }
    if (membership?.plan === planId) { toast.error('This is already your current plan.'); return; }
    setIsPurchasing(planId);
    try {
      const plan = [...plansData.personal, ...plansData.business].find(p => p.id === planId);
      const finalPrice = calculateFinalPrice(plan);
      if (planId === 'free') { await updateUserMembership(user.uid, planId, billingCycle); toast.success('Successfully downgraded to Free plan!'); }
      else {
        const paymentData = { transactionId: `txn_${Date.now()}`, method: 'card', amount: finalPrice, originalAmount: billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice, couponCode: appliedCoupon ? couponCode : null, currency: 'INR' };
        await updateUserMembership(user.uid, planId, billingCycle, paymentData);
        toast.success(`Successfully upgraded to ${plan.title} plan!`);
      }
      await refreshUserProfile();
    } catch (err) { console.error(err); toast.error('Something went wrong. Please try again.'); }
    finally { setIsPurchasing(null); }
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[#05060a] text-white"
      onClick={handlePageClick}
    >
      <Toaster />

      {/* Click Spark Effects */}
      {clickSparks.map(spark => (
        <ClickSpark
          key={spark.id}
          x={spark.x}
          y={spark.y}
          onComplete={() => removeSpark(spark.id)}
        />
      ))}

      {/* Floating Sparkles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingSparkle
            key={i}
            delay={i * 2}
            duration={8 + Math.random() * 4}
            left={5 + i * 12}
          />
        ))}
      </div>

      {/* Secret Deal Banner */}
      {showSecretDeal && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-2xl animate-bounce">
          🎉 SECRET DEAL: Use code EASTER50 for 50% off! 💰
        </div>
      )}

      {/* Cyberpunk Rain Background */}
      <div className="absolute inset-0 -z-20">
        <CyberpunkRain />
      </div>

      {/* Themed Emerald Grid Lines */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div
          className="absolute inset-0 bg-[size:40px_40px] 
          bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),
          linear-gradient(to_bottom,#10b981_1px,transparent_1px)]"
        ></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-24">

        {/* Header with Easter Egg - Click 7 times for secret */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div
            className={`relative inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full border-2 bg-[#0a0b10] mx-auto cursor-pointer transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] ${showSecretDeal ? 'animate-bounce border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.6)]' : 'border-emerald-500/50'
              }`}
            onMouseEnter={() => setHeaderSparkle(true)}
            onMouseLeave={() => setHeaderSparkle(false)}
            onClick={handleSecretClick}
          >
            <Sparkles className={`w-8 h-8 transition-all duration-300 ${headerSparkle || showSecretDeal ? 'text-yellow-400 animate-spin' : 'text-emerald-400'}`} />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-gray-400">
            Unlock the full potential of Relyce AI with a plan that fits your needs.
            Start for free and scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <span className={clsx("font-medium", billingCycle === 'monthly' ? 'text-white' : 'text-gray-500')}>Monthly</span>
          <button
            onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className={clsx(
              "relative w-14 h-8 rounded-full transition-colors duration-300 border-2",
              billingCycle === 'yearly' ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-700 border-gray-600'
            )}
          >
            <span className={clsx(
              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
              billingCycle === 'yearly' ? 'left-7' : 'left-1'
            )} />
          </button>
          <span className={clsx("font-medium", billingCycle === 'yearly' ? 'text-white' : 'text-gray-500')}>
            Yearly <span className="ml-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Save ~17%</span>
          </span>
        </div>

        {/* Coupon Section */}
        <div className="max-w-lg mx-auto mb-12">
          {!showAvailableCoupons && !appliedCoupon ? (
            <button onClick={() => setShowAvailableCoupons(true)} className="w-full text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2">
              <Zap size={16} /> Have a coupon code? Click here
            </button>
          ) : (
            <div className={`relative p-4 rounded-2xl bg-black/50 backdrop-blur-sm border transition-all duration-300 ${couponSparkle ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : 'border-emerald-500/30'}`}>
              {/* Sparkle Effect when coupon applied */}
              {couponSparkle && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-yellow-400 animate-ping"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.1}s`,
                        fontSize: `${10 + Math.random() * 8}px`,
                      }}
                    >
                      ✦
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-500 font-mono" disabled={!!appliedCoupon} />
                <button onClick={appliedCoupon ? removeCoupon : applyCoupon} className={clsx("px-5 py-2.5 rounded-lg font-semibold text-sm transition-all", appliedCoupon ? "bg-red-500 text-white hover:bg-red-600" : "bg-emerald-500 text-black hover:bg-emerald-400")}>
                  {appliedCoupon ? "Remove" : "Apply"}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-400">{couponError}</p>}
              {appliedCoupon && (
                <p className={`text-xs flex items-center gap-1 transition-all ${couponSparkle ? 'text-yellow-400 font-bold scale-105' : 'text-emerald-400'}`}>
                  <Check size={12} /> {appliedCoupon.description} applied! 🎉
                </p>
              )}
              {showAvailableCoupons && availableCoupons.length > 0 && !appliedCoupon && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  <p className="text-xs text-gray-500">Available Coupons:</p>
                  {availableCoupons.map((c) => (
                    <button key={c.id} onClick={() => setCouponCode(c.code)} className="w-full text-left p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors flex justify-between items-center">
                      <span className="font-mono font-bold text-emerald-400">{c.code}</span>
                      <span className="text-xs text-gray-400">{c.description}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={closeCouponPanel} className="mt-2 w-full text-center text-xs text-gray-500 hover:text-white transition-colors">
                Close
              </button>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid md:grid-cols-4 gap-8">
            <LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton />
          </div>
        ) : (
          <div className={clsx("grid gap-8", tab === 'personal' ? 'md:grid-cols-4' : 'md:grid-cols-1 max-w-md mx-auto')}>
            {plansData[tab].map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = membership?.plan === plan.id;
              const finalPrice = calculateFinalPrice(plan);

              return (
                <div
                  key={plan.id}
                  className={clsx(
                    'relative p-6 rounded-2xl bg-black/20 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer',
                    plan.popular ? 'border-2 border-emerald-500/70 shadow-emerald-500/20' : 'border border-emerald-500/30',
                    isCurrentPlan && 'ring-4 ring-emerald-500/50'
                  )}
                  onMouseEnter={() => handleEasterEgg(`plan-${plan.id}`)}
                  onMouseLeave={() => resetEasterEgg(`plan-${plan.id}`)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  {/* Confetti Easter Egg */}
                  <ConfettiBurst isActive={confettiPlan === `plan-${plan.id}`} planId={plan.id} />

                  {/* Icon with Easter Egg */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full border-2 bg-[#0a0b10] transition-all duration-300 ${easterEggs[`plan-${plan.id}`] ? 'border-pink-400 rotate-12 scale-110' : 'border-emerald-500/50'
                    }`}>
                    <Icon className={`w-8 h-8 transition-all duration-300 ${easterEggs[`plan-${plan.id}`] || 'text-emerald-400'}`} />
                  </div>

                  <h3 className="text-2xl font-semibold text-center">{plan.title}</h3>
                  <p className="mt-2 text-center text-gray-400 text-sm">{plan.subtitle}</p>

                  {/* Price */}
                  <div className="mt-6 text-center">
                    <span className="text-4xl font-bold">{finalPrice === 0 ? 'Free' : `₹${finalPrice}`}</span>
                    {finalPrice > 0 && <span className="text-gray-400 text-sm">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>}
                  </div>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="text-emerald-400 mt-0.5 shrink-0" size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isPurchasing === plan.id || isCurrentPlan}
                    className={clsx(
                      "w-full mt-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300",
                      isCurrentPlan
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105'
                    )}
                  >
                    {isPurchasing === plan.id ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Get Started'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            {tab === 'personal' ? "Need a plan for your entire team?" : "Looking for a personal plan?"}
          </p>
          <button
            onClick={() => setTab(t => t === 'personal' ? 'business' : 'personal')}
            className="px-6 py-2 text-emerald-400 border border-emerald-500/50 rounded-xl hover:bg-emerald-500/10 transition-colors"
          >
            {tab === 'personal' ? "View Business Plans" : "View Personal Plans"}
          </button>
        </div>

      </div>

      {/* Custom Animations for Easter Eggs */}
      <style>{`
        @keyframes float-coin {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-50px) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes spark {
          0% { transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--rotation, 0deg)) translateY(-30px) scale(0); opacity: 0; }
        }
        .animate-float-coin {
          animation: float-coin linear infinite;
        }
        .animate-confetti {
          animation: confetti 0.8s ease-out forwards;
        }
        .animate-spark {
          animation: spark 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}