import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

const CourseManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [_, setShowCourseForm] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Algorithms",
      description: "Learn the basics of algorithmic thinking",
      units: [
        {
          id: 1,
          title: "Sorting Algorithms",
          modules: [
            {
              id: 1,
              title: "Bubble Sort",
              sections: [
                {
                  type: "text",
                  content: "Bubble sort is a simple sorting algorithm...",
                },
                {
                  type: "code",
                  content: "def bubble_sort(arr):\n    n = len(arr)...",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  const handleSectionSubmit = (sectionData) => {
    if (!selectedModule) return;

    setCourses((prev) =>
      prev.map((course) => ({
        ...course,
        units: course.units.map((unit) => ({
          ...unit,
          modules: unit.modules.map((module) => {
            if (module.id !== selectedModule.id) return module;

            if (editingSection) {
              // Editing existing section
              const sections = module.sections.map((section) =>
                section === editingSection ? sectionData : section
              );
              return { ...module, sections };
            } else {
              // Adding new section
              return {
                ...module,
                sections: [...module.sections, sectionData],
              };
            }
          }),
        })),
      }))
    );

    setShowSectionEditor(false);
    setEditingSection(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination || !selectedModule) return;

    const items = Array.from(selectedModule.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCourses((prev: any) =>
      prev.map((course) => ({
        ...course,
        units: course.units.map((unit) => ({
          ...unit,
          modules: unit.modules.map((module) =>
            module.id === selectedModule.id
              ? { ...module, sections: items }
              : module
          ),
        })),
      }))
    );
  };

  const handleCourseSubmit = (courseData) => {
    if (editingCourse) {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourse.id
            ? { ...courseData, id: course.id }
            : course
        )
      );
    } else {
      setCourses((prev) => [
        ...prev,
        { ...courseData, id: Date.now(), units: [] },
      ]);
    }
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  // Render different routes
  const renderContent = () => {
    switch (activeRoute) {
      case "courses":
        return (
          <div className="grid grid-cols-12 gap-6">
            {/* Courses List */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedCourse?.id === course.id ? "bg-slate-100" : ""
                      }`}
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>{course.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Units List */}
            {selectedCourse && (
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedCourse.units.map((unit) => (
                      <div
                        key={unit.id}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
                          selectedUnit?.id === unit.id ? "bg-slate-100" : ""
                        }`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <div className="flex items-center">
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          <span>{unit.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules List */}
            {selectedUnit && (
              <Card className="col-span-6">
                <CardHeader>
                  <CardTitle>Modules & Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUnit.modules.map((module) => (
                    <div key={module.id} className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {module.title}
                        </h3>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Section
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {module.sections.map((section, index) => (
                          <div
                            key={index}
                            className="flex items-start p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="mb-1 text-sm font-medium text-gray-500">
                                {section.type.charAt(0).toUpperCase() +
                                  section.type.slice(1)}
                              </div>
                              <div className="text-sm">{section.content}</div>
                            </div>
                            <div className="flex ml-4 space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSection(section);
                                  setSelectedModule(module);
                                  setShowSectionEditor(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      default:
        return (
          <SectionEditorDialog
            isOpen={showSectionEditor}
            onClose={() => {
              setShowSectionEditor(false);
              setEditingSection(null);
            }}
            onSave={handleSectionSubmit}
            section={editingSection}
          />
        );
    }
  };

  return (
    <div className="flex">
      <Sidebar
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        className={`transition-all duration-200 ${
          isCollapsed ? "ml-16" : "ml-64"
        } flex-1 p-8`}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {activeRoute.charAt(0).toUpperCase() + activeRoute.slice(1)}
          </h1>
          {activeRoute === "courses" && (
            <Button onClick={() => setShowCourseForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Course
            </Button>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CourseManagement;
