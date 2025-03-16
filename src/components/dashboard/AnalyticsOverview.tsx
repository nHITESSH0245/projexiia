
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Analytics } from '@/types';

interface AnalyticsOverviewProps {
  analytics: Analytics;
  role: 'student' | 'faculty';
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ analytics, role }) => {
  const projectData = [
    { name: 'Pending', value: analytics.pendingProjects },
    { name: 'In Review', value: analytics.inReviewProjects },
    { name: 'Changes Requested', value: analytics.changesRequestedProjects },
    { name: 'Approved', value: analytics.approvedProjects },
  ];

  const taskData = [
    { name: 'Completed', value: analytics.completedTasks },
    { name: 'Pending', value: analytics.pendingTasks },
    { name: 'High Priority', value: analytics.highPriorityTasks },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.pendingProjects + analytics.inReviewProjects + analytics.changesRequestedProjects + analytics.approvedProjects}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all statuses
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.completedTasks}</div>
          <p className="text-xs text-muted-foreground">
            Out of {analytics.completedTasks + analytics.pendingTasks} total tasks
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.highPriorityTasks}</div>
          <p className="text-xs text-muted-foreground">
            Requiring immediate attention
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.approvedProjects}</div>
          <p className="text-xs text-muted-foreground">
            Successfully completed projects
          </p>
        </CardContent>
      </Card>
      
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
          <CardDescription>Distribution of projects across different statuses</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projectData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
          <CardDescription>Distribution of tasks across different categories</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={taskData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
