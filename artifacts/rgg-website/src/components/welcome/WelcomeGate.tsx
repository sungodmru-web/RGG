import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "wouter";

interface WelcomeGateProps {
  onChooseLanguage: (language: "en" | "fr") => void;
  initialLanguage?: "en" | "fr";
}

export default function WelcomeGate({
  onChooseLanguage,
  initialLanguage,
}: WelcomeGateProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFrench = initialLanguage === "fr";

  // Play/Pause video based on reduced motion
  useEffect(() => {
    // Warm the large WebGL chunk and its texture while the welcome film plays.
    // This keeps the welcome screen fast while making the 360° book ready
    // before a visitor reaches the book page.
    void import("@/components/book/RGGBook3D");

    if (videoRef.current) {
      if (shouldReduceMotion) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked by browser policy; silently ignore.
        });
      }
    }
  }, [shouldReduceMotion]);

  const handleEnter = (lang: "en" | "fr") => {
    setIsLeaving(true);
    setTimeout(
      () => {
        onChooseLanguage(lang);
      },
      shouldReduceMotion ? 400 : 1200,
    ); // Faster exit if reduced motion
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0 },
  };

  const blurVariants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
    },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0.4 : 1.2,
              ease: "easeInOut",
            },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#060806]"
          role="dialog"
          aria-modal="true"
          aria-label={
            isFrench
              ? "Bienvenue sur Reclaiming the Green Gold"
              : "Welcome to Reclaiming the Green Gold"
          }
        >
          {/* Video Background */}
          <div className="absolute inset-0 z-0 bg-[#060806]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 3,
                ease: "easeOut",
              }}
              className="relative h-full w-full overflow-hidden"
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/media/rgg-welcome-poster.jpg"
                className="absolute inset-0 h-full w-full object-cover opacity-75 [backface-visibility:hidden] [transform:translateZ(0)]"
              >
                <source src="/media/rgg-welcome.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.72)_0%,rgba(4,8,5,0.18)_28%,rgba(4,8,5,0.18)_72%,rgba(4,8,5,0.72)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#050805]/85 via-[#071009]/20 to-[#050805]/95" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(3,7,4,0.82)_100%)]" />
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.055] mix-blend-screen"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
                }}
              />
            </motion.div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[clamp(18px,3.5vh,42px)] bg-black/90"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[clamp(18px,3.5vh,42px)] bg-black/90"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-5 z-10 border border-[#C8A96B]/10 md:inset-10"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 2, delay: 0.8 }}
            aria-hidden="true"
            className="pointer-events-none absolute left-8 top-12 z-20 hidden text-[8px] uppercase tracking-[0.38em] text-[#C8BFA0]/60 md:block"
          >
            RGG
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 2, delay: 0.8 }}
            aria-hidden="true"
            className="pointer-events-none absolute right-8 top-12 z-20 hidden text-[8px] uppercase tracking-[0.38em] text-[#C8BFA0]/60 md:block"
          >
            {isFrench
              ? "Gouvernance · Recherche · Réforme"
              : "Governance · Research · Reform"}
          </motion.div>
          <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 py-[clamp(38px,6vh,72px)] text-center">
            <div className="mt-16 flex w-full max-w-5xl flex-1 flex-col items-center justify-center md:mt-8 mx-auto">
              {/* Logo */}
              <motion.div
                variants={blurVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 2,
                  ease: "easeOut",
                  delay: shouldReduceMotion ? 0 : 0.2,
                }}
                className="mb-8"
              >
                <img
                  src={`${import.meta.env.BASE_URL}images/rgg-official-logo.png`}
                  alt=""
                  aria-hidden="true"
                  className="h-28 w-28 object-contain drop-shadow-[0_0_30px_rgba(200,169,107,0.3)] md:h-40 md:w-40"
                />
              </motion.div>

              {/* Title */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                  delay: shouldReduceMotion ? 0 : 1,
                }}
                className="mb-12 space-y-6 md:mb-16"
              >
                <h1 className="font-serif text-3xl font-light leading-tight tracking-[0.025em] text-[#F4F1EA] drop-shadow-[0_3px_22px_rgba(0,0,0,0.9)] md:text-5xl lg:text-6xl">
                  Reclaiming the{" "}
                  <span className="text-[#C8A96B]">Green Gold</span>
                </h1>
                <p className="mx-auto max-w-2xl px-4 text-[10px] font-light leading-relaxed tracking-[0.3em] text-[#C8BFA0] uppercase md:text-xs">
                  A Global Framework for Cannabis Governance,
                  <br className="hidden md:block" />{" "}
                  Public Health, and Sustainable Development
                </p>
              </motion.div>

              {/* Language Selection */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                  delay: shouldReduceMotion ? 0 : 1.8,
                }}
                className="flex w-full flex-col items-center"
              >
                <p className="mb-8 text-[9px] font-medium tracking-[0.4em] text-[#7A9080] uppercase">
                  {isFrench
                    ? "Choisissez votre langue"
                    : "Select your language"}
                </p>
                <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-4 px-4 sm:flex-row sm:gap-6">
                  <button
                    onClick={() => handleEnter("en")}
                    className="group relative flex-1 overflow-hidden border border-[#C8A96B]/35 bg-[#071009]/65 px-8 py-5 shadow-[0_12px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-700 hover:border-[#C8A96B] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]"
                  >
                    <span className="relative z-10 text-xs font-medium tracking-[0.25em] text-[#F4F1EA] uppercase transition-colors duration-500 group-hover:text-[#0B0B0B] md:text-sm">
                      English
                    </span>
                    <div className="absolute inset-0 origin-bottom scale-y-0 bg-[#C8A96B] transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
                  </button>

                  <button
                    onClick={() => handleEnter("fr")}
                    className="group relative flex-1 overflow-hidden border border-[#C8A96B]/35 bg-[#071009]/65 px-8 py-5 shadow-[0_12px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-700 hover:border-[#C8A96B] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]"
                  >
                    <span className="relative z-10 text-xs font-medium tracking-[0.25em] text-[#F4F1EA] uppercase transition-colors duration-500 group-hover:text-[#0B0B0B] md:text-sm">
                      Français
                    </span>
                    <div className="absolute inset-0 origin-bottom scale-y-0 bg-[#C8A96B] transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Administrator Portal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 2.8,
              }}
              className="mt-auto pb-8"
            >
              <Link
                href="/admin"
                className="group flex flex-col items-center gap-4 text-[9px] tracking-[0.25em] text-[#56685D] uppercase transition-colors duration-500 hover:text-[#C8A96B] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A96B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B] rounded-sm"
              >
                <span>{isFrench ? "Portail admin" : "Admin portal"}</span>
                <div className="h-8 w-px bg-[#2A3F33] transition-all duration-500 group-hover:h-12 group-hover:bg-[#C8A96B]" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
