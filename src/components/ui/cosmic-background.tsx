"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<Star[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const numberOfStars = Math.floor((canvas.width * canvas.height) / 10000);
      stars.current = Array.from({ length: numberOfStars }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
      }));
    };

    const drawStars = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        // Move stars
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      animationFrameId.current = requestAnimationFrame(drawStars);
    };

    resizeCanvas();
    createStars();
    drawStars();

    const handleResize = () => {
      resizeCanvas();
      createStars();
    };

    window.addEventListener('resize', handleResize);

    // Fade in the canvas after a short delay
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(fadeInTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[-1] transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    />
  );
} 