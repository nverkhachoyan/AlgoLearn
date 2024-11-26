import {
  Home,
  BookOpen,
  Users,
  BarChart,
  Settings,
  ChevronLast,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = ({
  activeRoute,
  setActiveRoute,
  isCollapsed,
  setIsCollapsed,
}) => {
  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      route: "dashboard",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Courses",
      route: "courses",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Students",
      route: "students",
    },
    {
      icon: <BarChart className="w-5 h-5" />,
      label: "Analytics",
      route: "analytics",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      route: "settings",
    },
  ];

  return (
    <div
      className={`h-screen bg-slate-900 text-white fixed left-0 top-0 p-4 transition-all duration-200 
          ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && <h1 className="text-xl font-bold">AlgoLearn</h1>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-slate-800"
        >
          {isCollapsed ? <ChevronLast /> : <ChevronLeft />}
        </Button>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.route}
            onClick={() => setActiveRoute(item.route)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeRoute === item.route ? "bg-slate-700" : "hover:bg-slate-800"
            }`}
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
