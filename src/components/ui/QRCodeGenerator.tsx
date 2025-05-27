"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({
  value,
  size = 200,
  className = "",
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).catch((err) => {
        console.error("Error generating QR code:", err);
      });
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-200 rounded-lg ${className}`}
      width={size}
      height={size}
    />
  );
}
