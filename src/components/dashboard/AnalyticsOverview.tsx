
import { useEffect, useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentAnalytics, getFacultyAnalytics } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Analytics } from '@/types';
import { ArrowUpRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const AnalyticsOverview = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        if (user.role === 'student') {
          const { analytics, error } = await getStudentAnalytics();
          if (error) {
            console.error('Error fetching analytics:', error);
            return;
          }
          setAnalytics(analytics);
        } else {
          const { analytics, error } = await getFacultyAnalytics();
          if (error) {
            console.error('Error fetching analytics:', error);
            return;
          }
          setAnalytics(analytics);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gray-200 dark:bg-gray-700 h-6 w-12 rounded"></div>
              <p className="text-xs text-muted-foreground mt-2 bg-gray-200 dark:bg-gray-700 h-4 w-36 rounded"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  // Prepare chart data for project status
  const projectStatusData = [
    { name: 'Pending', value: analytics.pendingProjects, color: '#f97316' },
    { name: 'In Review', value: analytics.inReviewProjects, color: '#3b82f6' },
    { name: 'Changes Requested', value: analytics.changesRequestedProjects, color: '#eab308' },
    { name: 'Approved', value: analytics.approvedProjects, color: '#22c55e' },
  ];

  // Prepare chart data for task status
  const taskStatusData = [
    { name: 'Completed', value: analytics.completedTasks, color: '#22c55e' },
    { name: 'Pending', value: analytics.pendingTasks, color: '#f97316' },
  ];

  // Prepare chart data for task priority
  const taskPriorityData = [
    { name: 'High', value: analytics.highPriorityTasks, color: '#ef4444' },
    { name: 'Other', value: analytics.completedTasks + analytics.pendingTasks - analytics.highPriorityTasks, color: '#9ca3af' },
  ];

  // Custom chart render component
  const CustomPieChart = ({ data }: { data: Array<{ name: string; value: number; color: string }> }) => {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background border border-border p-2 rounded-md shadow-md">
                  <p className="font-semibold">{payload[0].name}: {payload[0].value}</p>
                </div>
              );
            }
            return null;
          }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.pendingProjects + analytics.inReviewProjects + 
                analytics.changesRequestedProjects + analytics.approvedProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.approvedProjects} approved projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completedTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.pendingTasks} tasks pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects In Review</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.inReviewProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.changesRequestedProjects} need changes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Tasks</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.highPriorityTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((analytics.highPriorityTasks / (analytics.completedTasks + analytics.pendingTasks || 1)) * 100)}% of all tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of projects by status</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <CustomPieChart data={projectStatusData} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Completed vs. pending tasks</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <CustomPieChart data={taskStatusData} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Priority</CardTitle>
            <CardDescription>High priority vs. other tasks</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <CustomPieChart data={taskPriorityData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
