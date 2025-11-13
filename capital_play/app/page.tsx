"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotScreenShader } from "@/components/shader-background";
import LoadingScreen from "@/app/loading";
import ProgressBar from "@/components/ProgressBar";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);

  const toggleVisibility = () => setShowAbout(!showAbout);

  return (
    <div>
      <LoadingScreen>
        <div className="relative h-screen w-screen overflow-hidden">
          <div className="absolute overflow-hidden inset-0">
            <DotScreenShader />
          </div>
          <div className="relative overflow-hidden">
            <ProgressBar />
            <Navbar />
            <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
              {/* 🔹 Shader no fundo */}
              <div className="absolute inset-0 z-0">
                <DotScreenShader />
              </div>

              {/* 🔹 Conteúdo acima */}
              <div className="relative z-10 flex flex-col items-center gap-6 text-center text-white font-outfit overflow-hidden">
                <AnimatePresence mode="wait">
                  {!showAbout ? (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-6"
                    >
                      <h1 className="font-poiretone text-6xl md:text-7xl font-light mix-blend-exclusion">
                        INOVAÇÃO FINANCEIRA
                      </h1>
                      <p className="text-lg md:text-xl font-light max-w-2xl leading-relaxed mix-blend-exclusion">
                        A Inovação Financeira representa a convergência entre tecnologia, criatividade e estratégia.
                        É o movimento que transforma dados em decisões, conecta pessoas a novas oportunidades e redefine
                        a forma como o valor circula no mundo digital.
                      </p>
                      <button
                        onClick={toggleVisibility}
                        className="text-base font-light rounded-full bg-blue-500 py-2 px-4 text-white cursor-pointer transition-transform "
                      >
                        Saiba mais
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-6"
                    >
                      <h1 className="font-poiretone text-6xl md:text-7xl font-light mix-blend-exclusion">
                        SOBRE O PROJETO
                      </h1>
                      <p className="text-lg md:text-xl font-light max-w-2xl leading-relaxed mix-blend-exclusion">
                        Este projeto faz parte do curso de Sistemas de Informação da UNA Aimorés e tem como objetivo o 
                        desenvolvimento de uma aplicação web inovadora, que proporcione ao usuário uma experiência gamificada.
                        A proposta busca unir tecnologia, design e interatividade para transformar o aprendizado e o uso da 
                        aplicação em uma jornada dinâmica, envolvente e motivadora.
                      </p>
                      <button
                        onClick={toggleVisibility}
                        className="text-base font-light rounded-full bg-blue-500 py-2 px-4 text-white cursor-pointer transition-transform hover:scale-105"
                      >
                        Voltar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </LoadingScreen>
    </div>
  );
}
