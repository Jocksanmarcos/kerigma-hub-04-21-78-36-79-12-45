import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  TrendingUp, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3,
  Clock,
  CheckCircle,
  Target,
  Briefcase,
  Award,
  Lightbulb
} from 'lucide-react';
import { ExecutiveDashboard } from '@/components/admin/dashboard/ExecutiveDashboard';
import { StrategicInsights } from '@/components/admin/dashboard/StrategicInsights';

interface ProfessionalThemeProps {
  onViewReports?: () => void;
  onScheduleMeeting?: () => void;
  onViewAnalytics?: () => void;
}

export const ProfessionalTheme: React.FC<ProfessionalThemeProps> = ({
  onViewReports,
  onScheduleMeeting,
  onViewAnalytics
}) => {

  return (
    <div className="w-full space-y-6">
      {/* Executive Dashboard */}
      <ExecutiveDashboard 
        onViewReports={onViewReports}
        onScheduleMeeting={onScheduleMeeting}
        onViewAnalytics={onViewAnalytics}
      />
      
      {/* Strategic Insights */}
      <StrategicInsights />
    </div>
  );
};