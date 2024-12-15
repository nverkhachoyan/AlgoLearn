import { BarChart, Book, HomeIcon, Sidebar as SidebarIcon, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isHome = pathname === "/";
 
  return (
    <div className={`sidebar fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-56' : 'w-16'}`}>
        <div className="flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center gap-2 p-2 m-2 transition-colors rounded-xl sidebar-toggle"
          >
            <SidebarIcon className="w-6 h-6 text-white" />
          </button>
          <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <p className={`mx-2 text-lg font-semibold text-white ${isOpen ? 'opacity-100' : 'opacity-0'}`}>AlgoLearn</p>
          </span>
        </div>
   
         
        <div className="flex flex-col items-center mt-8">
          <ul className="items-center w-full space-y-4">
            <li className={`sidebar-menu-item ${isHome ? 'sidebar-menu-item-active' : ''} flex items-center justify-start mx-3 p-2 text-white transition-colors rounded cursor-pointer hover:bg-25A879`}>
              <div className="flex items-center">
                <HomeIcon className="w-6 h-6" />
                <span className={`ml-2 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Home</span>
              </div>
            </li>
            <li className={`sidebar-menu-item flex items-center justify-start mx-3 p-2 text-white transition-colors rounded cursor-pointer hover:bg-25A879`}>
              <div className="flex items-center">
                <Book className="w-6 h-6" />
                <span className={`ml-2 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Courses</span>
              </div>
            </li>
            <li className={`sidebar-menu-item flex items-center justify-start mx-3 p-2 text-white transition-colors rounded cursor-pointer hover:bg-25A879`}>
              <div className="flex items-center">
                <Users className="w-6 h-6" />
                <span className={`ml-2 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Students</span>
              </div>
            </li>
            <li className={`sidebar-menu-item flex items-center justify-start mx-3 p-2 text-white transition-colors rounded cursor-pointer hover:bg-25A879`}>
              <div className="flex items-center">
                <Users className="w-6 h-6" />
                <span className={`ml-2 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Teachers</span>
              </div>
            </li>
            <li className={`sidebar-menu-item flex items-center justify-start mx-3 p-2 text-white transition-colors rounded cursor-pointer hover:bg-25A879`}>
              <div className="flex items-center">
                <BarChart className="w-6 h-6" />
                <span className={`ml-2 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Statistics</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
  )
}
