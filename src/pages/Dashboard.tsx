import { QuickActions } from '@/components/dashboard/QuickActions';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <WelcomeCard />
      <StatsCards />
      <QuickActions />
    </div>
  )
}