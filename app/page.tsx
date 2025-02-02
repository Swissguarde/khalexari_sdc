"use client";

import FormModal from "@/app/components/form-modal";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 relative overflow-hidden">
      {/* Grainy effect overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative SVG shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
      >
        <svg
          className="absolute top-0 left-0 w-32 h-32 text-gray-600/20"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <svg
          className="absolute top-1/3 right-10 w-24 h-24 text-gray-600/20"
          viewBox="0 0 100 100"
        >
          <rect
            x="20"
            y="20"
            width="60"
            height="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <svg
          className="absolute bottom-20 left-1/4 w-40 h-40 text-gray-600/20"
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,10 90,90 10,90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            BEAM ANALYSIS
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Analyze beam deformation with precision using our advanced slope
            deflection calculator. Perfect for structural engineers and
            students.
          </motion.p>

          <FormModal />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 text-white border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <p>
                Calculate end moments, rotations, and deflections for various
                beam conditions.
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 text-white border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-3">Easy to Use</h3>
              <p>
                Simple interface designed for both students and professionals in
                structural engineering.
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 text-white border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-3">Accurate Results</h3>
              <p>
                Get precise calculations based on the slope deflection method
                for structural analysis.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
