import { Digest } from "./features/digest/Digest";
import { Notes } from "./features/notes/Notes";
import { Tasks } from "./features/tasks/Tasks";
import {
  BadgeCheckIcon,
  BellIcon,
  Bot,
  CalendarDays,
  CirclePlus,
  CreditCardIcon,
  List,
  LogOutIcon,
  NotebookText,
  Search,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "../src/components/ui/tabs";
import { Button } from "./components/ui/button";
import { api } from "./api/client";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./components/ui/input";
import LiveClock from "./features/general/LiveClock";
import { NotesCalendarView, getWeekDates, toLocalDateKey } from "./features/notes/NotesCalendarView";
import { TasksCalendarView } from "./features/tasks/TasksCalendarView";
import { toast } from "sonner";

import { AuthLayout } from "./features/auth/authLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import AiUsage from "./features/general/AiUsage";
import HorizontalScroll from "./features/general/Landing";
import { NotesListView } from "./features/notes/NotesListView";

function App() {
  const [search, setSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState({ status: "", due: "" });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedView, setSelectedView] = useState("notes");
  const [showLanding, setShowLanding] = useState(true);
  const [selectedTab, setSelectedTab] = useState("notesTabView");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [limitReached, setLimitReached] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [tempNotes, setTempNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const dates = getWeekDates(weekOffset);
    return { startDate: toLocalDateKey(dates[0]), endDate: toLocalDateKey(dates[6]) };
  }, [weekOffset]);

  const queryClient = useQueryClient();
  const prevNotesRef = useRef<any[]>([]);

  const { data: currentUser } = useQuery({
    enabled: isLoggedIn,
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data as {
        email: string;
        name: string;
        picture: string;
        aiUsageCount: number;
        aiUsageLimit: number;
      };
    },
  });

  const {
    data: notesData,
    error,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    enabled: isLoggedIn,
    queryKey: ["notes", debouncedSearch],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await api.get("/notes", {
        params: { q: debouncedSearch, limit: 20, skip: pageParam },
      });
      return res.data as { notes: any[]; total: number; hasMore: boolean };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + lastPage.notes.length : undefined,
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.pages.some((p) =>
        p.notes.some((n: any) => n.processingStatus === "processing"),
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const { data: calendarNotes = [] } = useQuery({
    enabled: isLoggedIn && selectedView === "calendar",
    queryKey: ["notes", "week", startDate, endDate],
    queryFn: async () => {
      const res = await api.get("/notes", { params: { startDate, endDate } });
      return res.data.notes as any[];
    },
  });

  // delete mutation for tasks and notes
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: any) => {
      if (id.includes("temp")) return;
      if (type === "note") {
        await api.delete(`/notes/${id}`);
      } else if (type === "task") {
        await api.delete(`/tasks/${id}`);
      }
    },
    onError: () => toast.error("Failed to delete. Please try again."),
    onSuccess: (_data, variables) => {
      if (variables.id?.includes("temp")) {
        setTempNotes((prev) => prev.filter((n) => n._id !== variables.id));
        return;
      }
      if (variables.type === "note") {
        toast.success("Note deleted");
      } else if (variables.type === "task") {
        toast.success("Task deleted");
      }
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const notes = notesData?.pages.flatMap((p) => p.notes) ?? [];
  useEffect(() => {
    const prev = prevNotesRef.current;
    const justCompleted = notes.filter(
      (n) =>
        prev.find(
          (p) => p._id === n._id && p.processingStatus === "processing",
        ) && n.processingStatus === "completed",
    );
    if (justCompleted.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
    prevNotesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (isError && error) {
      const err: any = error;

      if (err.response?.data?.error === "AI usage limit reached") {
        setLimitReached(true);
      }
    }
  }, [isError, error]);

  // const mutation = useMutation({
  //   mutationFn: async () => {
  //     await api.post("/notes", { body: text, theme });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["notes"] });
  //     setText("");
  //   },
  // });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body, theme, title, extractTasks }: any) => {
      if (id.includes("temp")) {
        await api.post("/notes", { body, theme, title, extractTasks });
      } else {
        await api.patch(`/notes/${id}`, { body, theme, title, extractTasks });
      }
    },
    onError: () => toast.error("Failed to save note. Please try again."),
    onSuccess: (_data, variables) => {
      if (variables.id.includes("temp")) {
        setTempNotes((prev) => prev.filter((n) => n._id !== variables.id));
      }
      toast.success("Note saved");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const updateNote = (
    id: string,
    body: string,
    theme: string,
    title: string,
    extractTasks = true,
  ) => {
    return updateMutation.mutateAsync({ id, body, theme, title, extractTasks });
  };

  const { data: tasks = [] } = useQuery({
    enabled: isLoggedIn,
    queryKey: ["tasks", taskFilter, "notes"],
    queryFn: async () => {
      if (!isLoggedIn) {
        return [];
      }
      const res = await api.get("/tasks", { params: taskFilter });
      return res.data.tasks;
    },
    // refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  const taskUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: any) => {
      await api.patch(`/tasks/${id}`, { status });
    },
    onError: () => toast.error("Failed to update task. Please try again."),
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const pushNewNote = () => {
    const newNote = {
      _id: Math.random().toString(36).substr(2, 9) + "-temp",
      title: "",
      body: "",
      theme: "lavender",
      processingStatus: "idle",
      createdAt: new Date().toISOString(),
    };
    setTempNotes((prev) => [newNote, ...prev]);
  };

  const viewSourceNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setSelectedTab("notesTabView");
    setSelectedView("list");
  };

  const handleUserLogin = (value: boolean) => {
    setIsLoggedIn(value);
    if (value) {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    }
  };
  return (
    <div className="min-h-screen max-h-screen bg-[#0e0e1a] p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="text-white font-semibold py-2 tracking-[0.2rem] text-base pl-4">
          Note<span className="text-indigo-500 rotate-90 text-lg">!</span>t
        </div>
        {/* show tabsection only if user is logged in */}
        {isLoggedIn && (
          <div className="tabsSection">
            <button
              className={`text-white px-3 py-1 text-sm ${selectedTab === "notesTabView" ? "border-b-2 border-white" : null} `}
              onClick={() => setSelectedTab("notesTabView")}
            >
              Notes
            </button>
            <button
              className={`text-white px-3 py-1 text-sm ${selectedTab === "tasksTabView" ? "border-b-2 border-white" : null} `}
              onClick={() => setSelectedTab("tasksTabView")}
            >
              Tasks
            </button>
            <button
              className={`text-white px-3 py-1 text-sm ${selectedTab === "digestTabView" ? "border-b-2 border-white" : null} `}
              onClick={() => setSelectedTab("digestTabView")}
            >
              Digest
            </button>
          </div>
        )}
        {/* show user details only if user is logged in */}
        {isLoggedIn && (
          <div className="userDetails flex justify-start items-center gap-2 pr-4">
            <AiUsage limitReached={limitReached} />
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage
                        src={currentUser?.picture || ""}
                        alt={currentUser?.name || currentUser?.email || ""}
                      />
                      <AvatarFallback>
                        {(currentUser?.name || currentUser?.email || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => toast.info("Account settings — coming soon")}>
                      <BadgeCheckIcon />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Billing — coming soon")}>
                      <CreditCardIcon />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Notifications — coming soon")}>
                      <BellIcon />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                  >
                    <LogOutIcon />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-white font-light">
                {currentUser?.name || currentUser?.email}
              </div>
              <div className="text-xs text-slate-300 font-light">
                {currentUser?.email}
              </div>
            </div>
          </div>
        )}
        {!isLoggedIn && (
          <>
            <button
              className="btn-primary text-white border-none px-7 py-3 rounded-[10px] text-sm cursor-pointer transition-all duration-200 font-sans shadow-[0_8px_24px_rgba(124,111,255,0.25)]"
              style={{ background: "#7C6FFF" }}
              onClick={() => setShowLanding(false)}
            >
              Login to NoteIt
            </button>
          </>
        )}
      </div>
      {!isLoggedIn && (
        <div className="rounded-2xl min-h-full max-h-full overflow-auto  flex flex-col flex-1 ">
          {showLanding ? (
            <div className="bg-slate-950 rounded-2xl h-full overflow-auto flex flex-col flex-1">
              <HorizontalScroll setShowLanding={setShowLanding} />
            </div>
          ) : (
            <div className="bg-slate-100 rounded-2xl h-full overflow-auto flex flex-col flex-1">
              <AuthLayout onAuth={handleUserLogin} />
            </div>
          )}
        </div>
      )}
      {isLoggedIn && (
        <div className="bg-slate-100 rounded-2xl h-full overflow-auto flex flex-col flex-1 ">
          <div className="flex w-full items-center p-4 px-8">
            <div className="text-2xl text-slate-800 w-[40%]">
              {" "}
              👋Welcome {currentUser?.name?.split(" ")[0] || "back"}!
            </div>
            <div className="flex gap-2 items-center w-[60%] justify-end">
              {selectedTab === "notesTabView" && (
                <>
                  <Search />
                  <Input
                    id="input-field-username"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-[200px]"
                  />
                </>
              )}
              {selectedTab === "tasksTabView" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => setTaskFilter({ status: "todo" })}
                  >
                    Todo
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setTaskFilter({ status: "today" })}
                  >
                    Today
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setTaskFilter({ status: "overdue" })}
                  >
                    OverDue
                  </Button>
                </>
              )}

              <CalendarDays size={16} />
              <LiveClock />
            </div>
          </div>
          {selectedTab === "notesTabView" && (
            <div className="flex-1 p-4 overflow-hidden flex gap-4 h-full">
              <div className="min-h-full max-h-full flex flex-col gap-2 items-center py-2">
                <Button
                  size="icon"
                  className="rounded-full"
                  onClick={pushNewNote}
                >
                  <CirclePlus />
                </Button>
                <Tabs defaultValue="notesView" orientation="vertical">
                  <TabsList className="rounded-t-full rounded-b-full bg-slate-200">
                    <TabsTrigger
                      value="notesView"
                      className="p-2 rounded-full"
                      onClick={() => setSelectedView("notes")}
                    >
                      <NotebookText />
                    </TabsTrigger>
                    <TabsTrigger
                      value="calendarView"
                      className="p-2 rounded-full"
                      onClick={() => setSelectedView("calendar")}
                    >
                      <CalendarDays />
                    </TabsTrigger>
                    <TabsTrigger
                      value="listView"
                      className="p-2 rounded-full"
                      onClick={() => setSelectedView("list")}
                    >
                      <List />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowAiSummary((prev) => !prev)}
                >
                  <Bot />
                </Button>
              </div>
              <div className="flex-1 min-h-full max-h-full overflow-auto">
                {selectedView === "notes" && (
                  <Notes
                    notes={[...tempNotes, ...notes]}
                    onUpdateNote={updateNote}
                    taskUpdateMutation={taskUpdateMutation}
                    deleteMutation={deleteMutation}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onLoadMore={fetchNextPage}
                    showAiSummary={showAiSummary}
                    onCreateNote={pushNewNote}
                  />
                )}
                {selectedView === "calendar" && (
                  <NotesCalendarView
                    notes={[...tempNotes, ...calendarNotes]}
                    weekOffset={weekOffset}
                    onWeekChange={setWeekOffset}
                    onUpdateNote={updateNote}
                    deleteMutation={deleteMutation}
                    showAiSummary={showAiSummary}
                  />
                )}
                {selectedView === "list" && (
                  <NotesListView
                    notes={[...tempNotes, ...notes]}
                    onUpdateNote={updateNote}
                    showAiSummary={showAiSummary}
                    deleteMutation={deleteMutation}
                    initialSelectedNoteId={selectedNoteId}
                  />
                )}
                {/* <Notes notes={notes} onUpdateNote={updateNote} /> */}
              </div>
            </div>
          )}
          {selectedTab === "tasksTabView" && (
            <div className="flex-1 p-4 overflow-hidden flex gap-4 h-full">
              <div className="min-h-full max-h-full flex flex-col gap-2 items-center py-2">
                <Button
                  size="icon"
                  className="rounded-full"
                  onClick={pushNewNote}
                >
                  <CirclePlus />
                </Button>
                <Tabs defaultValue="notesView" orientation="vertical">
                  <TabsList className="rounded-t-full rounded-b-full bg-slate-200">
                    <TabsTrigger
                      value="notesView"
                      className="p-2 rounded-full"
                      onClick={() => setSelectedView("notes")}
                    >
                      <NotebookText />
                    </TabsTrigger>
                    <TabsTrigger
                      value="calendarView"
                      className="p-2 rounded-full"
                      onClick={() => setSelectedView("calendar")}
                    >
                      <CalendarDays />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-1 min-h-full max-h-full overflow-auto">
                {selectedView === "notes" && (
                  <Tasks
                    tasks={tasks}
                    mutation={taskUpdateMutation}
                    deleteMutation={deleteMutation}
                    onViewSourceNote={viewSourceNote}
                  />
                )}
                {selectedView === "calendar" && (
                  <TasksCalendarView
                    tasks={tasks}
                    mutation={taskUpdateMutation}
                    deleteMutation={deleteMutation}
                    onViewSourceNote={viewSourceNote}
                    className="max-h-full overflow-y-scroll"
                  />
                )}
              </div>
            </div>
          )}
          {selectedTab === "digestTabView" && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-4 p-10 bg-white rounded-2xl shadow-sm max-w-md text-center">
                <div className="text-5xl">🔧</div>
                <div className="text-xl font-semibold text-slate-800">Daily Digest — Coming Soon</div>
                <div className="text-sm text-slate-500 leading-relaxed">
                  We're building your AI-powered daily briefing — a curated summary of your notes, today's tasks, and upcoming deadlines. Check back soon!
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
