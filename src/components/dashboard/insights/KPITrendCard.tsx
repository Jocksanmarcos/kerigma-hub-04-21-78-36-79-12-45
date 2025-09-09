import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export type KPITrendPoint = { label: string; value: number };

type Props = {
  title: string;
  value: number | string;
  Icon: LucideIcon;
  colorVariant?: "primary" | "secondary" | "accent" | "destructive";
  trend?: KPITrendPoint[];
};

export const KPITrendCard: React.FC<Props> = ({ title, value, Icon, colorVariant = "primary", trend = [] }) => {
  const color = `hsl(var(--${colorVariant}))`;
  const gradientId = `${title.replace(/\s+/g, "-")}-gradient`;
  const toneClasses: Record<NonNullable<Props["colorVariant"]>, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${toneClasses[colorVariant]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold leading-tight">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
        </div>
        <div className="mt-4 h-14">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPITrendCard;
