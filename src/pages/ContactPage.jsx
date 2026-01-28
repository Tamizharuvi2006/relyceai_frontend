import React, { useState, useEffect } from 'react';
import { Mail, Send, Phone, MapPin, Clock, MessageCircle, Headphones, Building2, Rocket, Star } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaLinkedin } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

import { Helmet } from 'react-helmet-async';

// Easter egg colors for random hover effects
const easterEggColors = [
  'text-pink-400',
  'text-purple-400',
  'text-cyan-400',
  'text-yellow-400',
  'text-orange-400',
  'text-rose-400',
  'text-indigo-400',
  'text-teal-400',
];

// Card Data
const contactOptions = [
  {
    icon: Headphones,
    title: 'Customer Support',
    description: 'Having trouble with your account or subscription? Our support team is ready to help you 24/7.',
    action: 'Get Support',
    link: '#contact-form'
  },
  {
    icon: Building2,
    title: 'Enterprise Solutions',
    description: 'Looking for custom AI solutions for your organization? Let\'s discuss your requirements.',
    action: 'Talk to Sales',
    link: '#contact-form'
  },
  {
    icon: Rocket,
    title: 'Partnership Opportunities',
    description: 'Interested in partnering with Relyce? We\'re always open to exciting collaborations.',
    action: 'Become a Partner',
    link: '#contact-form'
  },
];

const faqs = [
  {
    question: 'What makes Relyce AI different from other chatbots?',
    answer: 'Relyce AI is specifically designed to work with YOUR data. Unlike generic chatbots, it learns from your documents, databases, and knowledge bases to provide accurate, contextual answers that are relevant to your specific needs.',
  },
  {
    question: 'How quickly can I get started?',
    answer: 'You can start using Relyce AI within minutes! Simply sign up, upload your first document, and start asking questions. No complex setup or technical expertise required.',
  },
  {
    question: 'Is my data secure with Relyce AI?',
    answer: 'Absolutely. We use enterprise-grade encryption (AES-256) for all data at rest and in transit. Your documents are stored securely and never shared with third parties. For enterprise clients, we also offer on-premise deployment options.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes! All our plans come with no long-term commitments. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.',
  },
];

// Floating Star Component
const FloatingStar = ({ delay, duration, left, size }) => (
  <div
    className="absolute pointer-events-none animate-float"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    <Star
      className="text-emerald-400/20"
      size={size}
      fill="currentColor"
    />
  </div>
);

// Sparkle Effect Component
const SparkleEffect = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
          }}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute text-yellow-300 animate-bounce"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            fontSize: `${8 + Math.random() * 8}px`,
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
};

// Click Burst Effect Component
const ClickBurst = ({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x - 50, top: y - 50 }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-burst"
          style={{
            transform: `rotate(${i * 45}deg) translateY(-20px)`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [easterEggs, setEasterEggs] = useState({});
  const [heroSparkle, setHeroSparkle] = useState(false);
  const [clickBursts, setClickBursts] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  // Secret message after 5 clicks on hero icon
  const handleHeroClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setShowSecret(true);
      toast('🎉 You found a secret! You\'re awesome!', { icon: '✨' });
      setTimeout(() => setShowSecret(false), 3000);
      setClickCount(0);
    }
  };

  // Click burst effect anywhere on page
  const handlePageClick = (e) => {
    if (Math.random() > 0.7) { // 30% chance
      const id = Date.now();
      setClickBursts(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    }
  };

  const removeBurst = (id) => {
    setClickBursts(prev => prev.filter(b => b.id !== id));
  };

  const handleEasterEgg = (id) => {
    const randomColor = easterEggColors[Math.floor(Math.random() * easterEggColors.length)];
    setEasterEggs(prev => ({ ...prev, [id]: randomColor }));
  };

  const resetEasterEgg = (id) => {
    setEasterEggs(prev => ({ ...prev, [id]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#05060a] text-white"
      onClick={handlePageClick}
    >
      <Helmet>
        <title>Contact Relyce AI – Get in Touch</title>
        <meta
          name="description"
          content="Have questions about Relyce AI? Contact our team for support, sales, or partnerships."
        />
        <link rel="canonical" href="https://relyceai.com/contact" />
      </Helmet>
      <Toaster />

      {/* Click Burst Effects */}
      {clickBursts.map(burst => (
        <ClickBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          onComplete={() => removeBurst(burst.id)}
        />
      ))}

      {/* Floating Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <FloatingStar
            key={i}
            delay={i * 2}
            duration={8 + Math.random() * 4}
            left={10 + i * 15}
            size={12 + Math.random() * 12}
          />
        ))}
      </div>

      {/* Themed Emerald Grid Lines */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div
          className="absolute inset-0 bg-[size:40px_40px] 
          bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),
          linear-gradient(to_bottom,#10b981_1px,transparent_1px)]"
        ></div>
      </div>

      {/* --- Section 1: Hero --- */}
      <section className="relative py-24 flex items-center justify-center text-center">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Easter Egg Hero Icon - Click 5 times for secret */}
          <div
            className={`relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 bg-[#0a0b10] mx-auto cursor-pointer transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] ${showSecret ? 'animate-bounce border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.6)]' : 'border-emerald-500/50'
              }`}
            onMouseEnter={() => setHeroSparkle(true)}
            onMouseLeave={() => setHeroSparkle(false)}
            onClick={handleHeroClick}
          >
            <MessageCircle className={`w-10 h-10 transition-all duration-300 ${heroSparkle || showSecret ? 'text-yellow-400 animate-spin' : 'text-emerald-400'}`} />
            <SparkleEffect isActive={heroSparkle || showSecret} />
          </div>

          {/* Secret Message */}
          {showSecret && (
            <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg">
              🎉 Easter Egg Found! You're a curious one! 🎉
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
            We'd Love to Hear From You
          </h1>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-gray-400 max-w-2xl mx-auto">
            Got questions about Relyce AI? Need help with your subscription? Or just want to say hello?
            We're here and ready to help.
          </p>
        </div>
      </section>

      {/* --- Section 2: Contact Options --- */}
      <section className="py-16 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-black/20 shadow-lg border border-emerald-500/30 text-center transition-all duration-300 hover:scale-105 hover:border-emerald-500/60 hover:bg-black/40 cursor-pointer"
                onMouseEnter={() => handleEasterEgg(`option-${index}`)}
                onMouseLeave={() => resetEasterEgg(`option-${index}`)}
              >
                <div className={`relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full border-2 bg-[#0a0b10] transition-all duration-300 ${easterEggs[`option-${index}`] ? 'border-pink-400 rotate-12 scale-110' : 'border-emerald-500/50 group-hover:border-emerald-400'
                  }`}>
                  <option.icon className={`w-8 h-8 transition-all duration-300 ${easterEggs[`option-${index}`] || 'text-emerald-400'}`} />
                </div>
                <h3 className="text-xl font-bold">{option.title}</h3>
                <p className="mt-3 text-gray-400 text-sm">{option.description}</p>
                <button
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-block mt-6 px-6 py-2 text-sm font-semibold text-emerald-400 border border-emerald-500/50 rounded-xl hover:bg-emerald-500 hover:text-black transition-all"
                >
                  {option.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Contact Form & Info --- */}
      <section id="contact-form" className="py-24 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left Side: Contact Info */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
                <p className="mt-4 leading-relaxed text-gray-400">
                  Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                </p>
              </div>

              {/* Contact Details with Easter Eggs */}
              <div className="space-y-6">
                <div
                  className="flex items-start gap-4 cursor-pointer group"
                  onMouseEnter={() => handleEasterEgg('email')}
                  onMouseLeave={() => resetEasterEgg('email')}
                >
                  <div className={`w-12 h-12 rounded-full border bg-black/30 flex items-center justify-center shrink-0 transition-all duration-300 ${easterEggs['email'] ? 'border-cyan-400 scale-110 rotate-6' : 'border-emerald-500/30'
                    }`}>
                    <Mail className={`w-5 h-5 transition-all duration-300 ${easterEggs['email'] || 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Email Us</h4>
                    <a href="mailto:support@relyce.ai" className="text-gray-400 hover:text-emerald-400 transition-colors">support@relyce.ai</a>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 cursor-pointer group"
                  onMouseEnter={() => handleEasterEgg('phone')}
                  onMouseLeave={() => resetEasterEgg('phone')}
                >
                  <div className={`w-12 h-12 rounded-full border bg-black/30 flex items-center justify-center shrink-0 transition-all duration-300 ${easterEggs['phone'] ? 'border-purple-400 scale-110 rotate-6' : 'border-emerald-500/30'
                    }`}>
                    <Phone className={`w-5 h-5 transition-all duration-300 ${easterEggs['phone'] || 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Call Us</h4>
                    <a href="tel:+919876543210" className="text-gray-400 hover:text-emerald-400 transition-colors">+91 98765 43210</a>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 cursor-pointer group"
                  onMouseEnter={() => handleEasterEgg('address')}
                  onMouseLeave={() => resetEasterEgg('address')}
                >
                  <div className={`w-12 h-12 rounded-full border bg-black/30 flex items-center justify-center shrink-0 transition-all duration-300 ${easterEggs['address'] ? 'border-orange-400 scale-110 rotate-6' : 'border-emerald-500/30'
                    }`}>
                    <MapPin className={`w-5 h-5 transition-all duration-300 ${easterEggs['address'] || 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Visit Us</h4>
                    <p className="text-gray-400">Relyce Infotech Pvt. Ltd.<br />Chennai, Tamil Nadu, India</p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 cursor-pointer group"
                  onMouseEnter={() => handleEasterEgg('hours')}
                  onMouseLeave={() => resetEasterEgg('hours')}
                >
                  <div className={`w-12 h-12 rounded-full border bg-black/30 flex items-center justify-center shrink-0 transition-all duration-300 ${easterEggs['hours'] ? 'border-yellow-400 scale-110 rotate-6' : 'border-emerald-500/30'
                    }`}>
                    <Clock className={`w-5 h-5 transition-all duration-300 ${easterEggs['hours'] || 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Working Hours</h4>
                    <p className="text-gray-400">Monday - Friday: 9:00 AM - 6:00 PM IST<br />Weekend support available for enterprise clients</p>
                  </div>
                </div>
              </div>

              {/* Social Links with Easter Eggs */}
              <div className="pt-6 border-t border-emerald-500/20">
                <h4 className="font-semibold text-white mb-4">Connect With Us</h4>
                <div className="flex gap-4">
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-emerald-500/30 bg-black/30 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400 hover:scale-110 hover:rotate-12 transition-all duration-300"
                  >
                    <FaWhatsapp size={22} />
                  </a>
                  <a
                    href="https://instagram.com/relyce.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-emerald-500/30 bg-black/30 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-400 hover:scale-110 hover:rotate-12 transition-all duration-300"
                  >
                    <FaInstagram size={22} />
                  </a>
                  <a
                    href="https://linkedin.com/company/relyce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-emerald-500/30 bg-black/30 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400 hover:scale-110 hover:rotate-12 transition-all duration-300"
                  >
                    <FaLinkedin size={22} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="p-8 sm:p-10 rounded-2xl bg-black/30 backdrop-blur-sm border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border-0 py-3 px-4 bg-[#05060a] text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all text-sm"
                      placeholder="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border-0 py-3 px-4 bg-[#05060a] text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all text-sm"
                      placeholder="your@gmail.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-300">Subject</label>
                  <select
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-0 py-3 px-4 bg-[#05060a] text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all text-sm"
                  >
                    <option value="">Select a topic...</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Subscription</option>
                    <option value="enterprise">Enterprise Inquiry</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">Your Message</label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border-0 py-3 px-4 bg-[#05060a] text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all text-sm resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 px-8 py-4 font-semibold rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* --- Section 4: FAQ with Easter Eggs --- */}
      <section className="py-24 relative z-10">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="relative inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full border-2 bg-[#0a0b10] border-emerald-500/50 mx-auto cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-180 hover:border-purple-400"
              onMouseEnter={() => handleEasterEgg('faq-icon')}
              onMouseLeave={() => resetEasterEgg('faq-icon')}
            >
              <MessageCircle className={`w-8 h-8 transition-all duration-300 ${easterEggs['faq-icon'] || 'text-emerald-400'}`} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Common Questions</h2>
            <p className="mt-4 text-gray-400">Find quick answers to frequently asked questions about Relyce AI.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-black/20 border border-emerald-500/30 transition-all duration-300 hover:border-emerald-500/60 cursor-pointer hover:translate-x-2"
                onMouseEnter={() => handleEasterEgg(`faq-${index}`)}
                onMouseLeave={() => resetEasterEgg(`faq-${index}`)}
              >
                <h3 className={`text-lg font-semibold transition-all duration-300 ${easterEggs[`faq-${index}`] || 'text-emerald-400'}`}>
                  {faq.question}
                </h3>
                <p className="mt-3 text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-400">Still have questions?</p>
            <button onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })} className="inline-block mt-4 px-8 py-3 font-semibold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 transition-all">
              Contact Our Team
            </button>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes burst {
          0% { transform: rotate(var(--rotation)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--rotation)) translateY(-50px) scale(0); opacity: 0; }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-burst {
          animation: burst 0.6s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
