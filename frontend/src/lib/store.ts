// ===== SHARED DATA STORE =====
// Uses localStorage to share data across all dashboard pages

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  category: 'study' | 'health' | 'career' | 'personal' | 'finance' | 'other';
  targetDate: string;
  progress: number;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  tech: string;
  status: 'planning' | 'inprogress' | 'completed' | 'paused';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  startDate: string;
  deadline: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'health' | 'learning' | 'fitness' | 'mindfulness' | 'productivity' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  reminder: string;
  streak: number;
  completedDates: string[];
  createdAt: string;
}

export interface DayData {
  plannedHours: number;
  actualHours: number;
  tasks: { text: string; completed: boolean }[];
  notes: string;
  status: 'planned' | 'completed' | 'missed' | 'inprogress';
}

export interface CalendarData {
  [date: string]: DayData;
}

export interface AppData {
  goals: Goal[];
  projects: Project[];
  habits: Habit[];
  calendar: CalendarData;
}

const STORAGE_KEY = 'dailyflow_app_data';

const defaultData: AppData = {
  goals: [],
  projects: [],
  habits: [],
  calendar: {},
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: Partial<AppData>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadData();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch event so other components can react
    window.dispatchEvent(new Event('dailyflow-update'));
  } catch (err) {
    console.error('Failed to save data:', err);
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Helper to get today's date string
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// Compute dashboard stats from app data
export function computeStats(data: AppData) {
  const today = getTodayStr();
  const todayData = data.calendar[today];

  // Today's progress
  const todayTasks = todayData?.tasks || [];
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const totalTasks = todayTasks.length;
  const todayProgress = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Goals
  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter(g => g.status === 'completed').length;
  const goalsProgress = totalGoals > 0
    ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Projects
  const activeProjects = data.projects.filter(
    p => p.status === 'inprogress' || p.status === 'planning'
  ).length;

  // Study hours this month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const studyHours = Object.entries(data.calendar)
    .filter(([date]) => date.startsWith(monthStr))
    .reduce((sum, [, day]) => sum + (day.actualHours || 0), 0);

  // Recent activity (last 5 logged days)
  const recentDays = Object.entries(data.calendar)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5)
    .map(([date, day]) => ({ date, ...day }));

  // Upcoming deadlines (goals with target dates)
  const upcoming = data.goals
    .filter(g => g.targetDate && g.status !== 'completed')
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    .slice(0, 5);

  return {
    todayProgress,
    todayTasks: `${completedTasks}/${totalTasks}`,
    goalsProgress,
    goalsCount: `${completedGoals}/${totalGoals}`,
    activeProjects,
    studyHours,
    recentDays,
    upcoming,
  };
}