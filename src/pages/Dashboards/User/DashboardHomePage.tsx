import { useAuth } from '@/firebase/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/pages/Dashboards/Admin/AdminDashboard';

const DashboardHomePage = () => {
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  // Show Admin Dashboard for admins
  if (dbUser?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10 bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          className={cn(
            'w-full max-w-3xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden'
          )}
        >
          <CardContent className="flex flex-col items-center text-center space-y-6 py-10">
            <img
              src="https://illustrations.popsy.co/gray/remote-work.svg"
              alt="Welcome Illustration"
              className="w-48 md:w-60 opacity-90 dark:invert transition-all duration-300"
            />

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Welcome back,&nbsp;
                <span className="text-primary">
                  {dbUser?.displayName || 'User'} 👋
                </span>
              </h1>

              <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
                We’re glad to have you here! Manage your books, trades, and
                messages easily from your dashboard. Let’s get started.
              </p>
            </div>

            <Button
              size="lg"
              className="flex items-center gap-2 font-medium"
              onClick={() => navigate('/dashboard/chats')}
            >
              Go to Chats
              <ArrowRight size={18} />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHomePage;
