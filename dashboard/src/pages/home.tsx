import "../styles/home.css";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  BookAIcon,
  CodeIcon,
  ImageIcon,
  ListIcon,
  TextIcon,
  PackageIcon,
  SchoolIcon,
  ListCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Draggable, { DraggableData } from "react-draggable";

const SECTION_HEIGHT = 160; // Height of each section including margin

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sections, setSections] = useState([
    { id: 1, type: "text", icon: TextIcon, content: "Data Structures are..." },
    { id: 2, type: "code", icon: CodeIcon, content: "Algorithms are..." },
    { id: 3, type: "list", icon: ListIcon, content: "Data types are..." },
    {
      id: 4,
      type: "image",
      icon: ImageIcon,
      content: "https://example.com/image.jpg",
    },
  ]);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const handleDragStart = (id: number) => {
    setDraggedId(id);
  };

  const handleDrag = (id: number, data: DraggableData) => {
    const draggedIndex = sections.findIndex((section) => section.id === id);
    const newIndex = Math.max(
      0,
      Math.min(Math.round(data.y / SECTION_HEIGHT), sections.length - 1)
    );

    if (newIndex !== draggedIndex) {
      const newSections = [...sections];
      const [draggedSection] = newSections.splice(draggedIndex, 1);
      newSections.splice(newIndex, 0, draggedSection);
      setSections(newSections);
    }
  };

  const handleDragStop = () => {
    setDraggedId(null);
  };

  return (
    <div className="">
      {/* Side Bar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full h-screen col-start-3 ml-16 col-end-21 scrollbar-hide">
        <PanelGroup direction="horizontal" className="w-full h-screen">
          <Panel
            defaultSize={30}
            minSize={20}
            className="p-4 border-r-2 border-white"
          >
            <div style={{ overflow: "auto", height: "100%" }}>
              <div className="flex items-center justify-center text-2xl font-bold">
                <BookAIcon className="w-6 h-6 mr-2" />{" "}
                <h2 className="text-2xl font-bold">Module Details</h2>
              </div>

              <div className="flex mt-4 text-xl font-bold">
                <h2>Introduction to Data Structures and Algorithms</h2>
              </div>
              <h5 className="text-sm">Authors: Bob, Alice</h5>
              <h2 className="mt-2 text-xl font-bold">
                <PackageIcon className="w-4 h-4" /> Module Description
              </h2>
              <p className="text-md">
                This module introduces the fundamental concepts of data
                structures and algorithms, providing a comprehensive overview of
                their importance and applications in computer science.
              </p>
              <h2 className="mt-2 text-xl font-bold">
                <ListCheckIcon className="w-4 h-4" /> Requirements
              </h2>
              <p className="text-md">
                Basic knowledge of programming concepts and algorithms.
              </p>
              <h2 className="my-2 mt-4 text-xl font-bold">
                <SchoolIcon className="w-4 h-4" /> Learning Outcomes
              </h2>
              <p className="text-md">
                By the end of this module, students will be able to:
              </p>
              <ul className="ml-4 list-disc list-inside text-md">
                <li>
                  Understand the importance of data structures and algorithms in
                  computer science.
                </li>
                <li>
                  Identify and implement common data structures and algorithms.
                </li>
              </ul>
            </div>
          </Panel>
          <PanelResizeHandle
            style={{ backgroundColor: "black", width: "10px" }}
          />
          <Panel className="p-4 border-r-2 border-white">
            {/* Module Creating Editor */}
            <div style={{ height: "100%", width: "90%" }}>
              <h1 className="mb-6 text-xl font-bold">Sections</h1>
              <div
                className="relative"
                style={{ height: sections.length * SECTION_HEIGHT }}
              >
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    axis="y"
                    bounds="parent"
                    position={{ x: 0, y: index * SECTION_HEIGHT }}
                    onStart={() => handleDragStart(section.id)}
                    onDrag={(e, data) => handleDrag(section.id, data)}
                    onStop={handleDragStop}
                  >
                    <div
                      className={`
                        absolute left-0 right-0
                        transition-transform duration-200
                        ${draggedId === section.id ? "z-50 shadow-lg" : "z-0"}
                      `}
                    >
                      <div
                        className={`
                          bg-white p-4 rounded-lg border-2 mb-4
                          ${
                            draggedId === section.id
                              ? "border-blue-500 shadow-xl"
                              : "border-gray-200"
                          }
                          transition-all duration-200
                        `}
                      >
                        <div className="flex items-center gap-2 cursor-move">
                          <section.icon className="w-4 h-4" />
                          {section.type.charAt(0).toUpperCase() +
                            section.type.slice(1)}
                        </div>
                        <textarea
                          className="w-full h-20 p-2 my-2 transition-colors duration-200 border-2 border-gray-500 rounded-xl focus:border-blue-500"
                          value={section.content}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[index].content = e.target.value;
                            setSections(newSections);
                          }}
                        />
                      </div>
                    </div>
                  </Draggable>
                ))}
              </div>
              <Button className="w-full mt-4 text-white bg-black hover:bg-gray-600">
                Add Section
              </Button>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Home;
