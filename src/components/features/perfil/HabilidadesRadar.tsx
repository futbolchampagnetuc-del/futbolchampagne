"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface HabilidadesRadarProps {
  habilidades: Record<string, number>;
}

export function HabilidadesRadar({ habilidades }: HabilidadesRadarProps) {
  // Map raw data into recharts expected array of objects
  const data = [
    { subject: "Velocidad", A: habilidades.velocidad || 3, fullMark: 5 },
    { subject: "Resistencia", A: habilidades.resistencia || 3, fullMark: 5 },
    { subject: "Fuerza", A: habilidades.fuerza || 3, fullMark: 5 },
    { subject: "Quite", A: habilidades.quite || 3, fullMark: 5 },
    { subject: "Marcación", A: habilidades.marcacion || 3, fullMark: 5 },
    { subject: "Pase", A: habilidades.pase || 3, fullMark: 5 },
    { subject: "Visión", A: habilidades.vision || 3, fullMark: 5 },
    { subject: "Pegada", A: habilidades.pegada || 3, fullMark: 5 },
    { subject: "Definición", A: habilidades.definicion || 3, fullMark: 5 },
    { subject: "Cabezazo", A: habilidades.cabezazo || 3, fullMark: 5 },
    { subject: "Juego Aéreo", A: habilidades.juego_aereo || 3, fullMark: 5 },
    { subject: "Liderazgo", A: habilidades.liderazgo || 3, fullMark: 5 },
    { subject: "Compromiso", A: habilidades.compromiso || 3, fullMark: 5 },
    { subject: "Estado Físico", A: habilidades.estado_fisico || 3, fullMark: 5 },
    { subject: "Juego Colec.", A: habilidades.juego_colectivo || 3, fullMark: 5 },
    { subject: "Fair Play", A: habilidades.fair_play || 3, fullMark: 5 },
  ];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} 
          />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Habilidades"
            dataKey="A"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
