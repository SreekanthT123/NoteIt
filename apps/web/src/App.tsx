import { Digest } from "./features/digest/Digest";
import { Notes } from "./features/notes/Notes";
import { Tasks } from "./features/tasks/Tasks";
import {
  BadgeCheckIcon,
  BellIcon,
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
import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import LiveClock from "./features/general/LiveClock";
import { NotesCalendarView } from "./features/notes/NotesCalendarView";
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

  const queryClient = useQueryClient();

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
  });

  const notes = notesData?.pages.flatMap((p) => p.notes) ?? [];
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
    mutationFn: async ({ id, body, theme, title }: any) => {
      if (id.includes("temp")) {
        await api.post("/notes", { body, theme, title });
      } else {
        await api.patch(`/notes/${id}`, { body, theme, title });
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      if (variables.id.includes("temp")) {
        toast.success("Notes saved successfully");
      }
    },
  });

  const updateNote = (
    id: string,
    body: string,
    theme: string,
    title: string,
  ) => {
    return updateMutation.mutateAsync({ id, body, theme, title });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const pushNewNote = () => {
    const newNote = {
      _id: Math.random().toString(36).substr(2, 9) + "-temp",
      title: "",
      body: "",
      theme: "lavender",
      processingStatus: "idle",
    };

    queryClient.setQueryData(["notes", debouncedSearch], (oldData: any) => {
      if (!oldData) {
        return {
          pages: [{ notes: [newNote], total: 1, hasMore: false }],
          pageParams: [0],
        };
      }
      return {
        ...oldData,
        pages: [
          {
            ...oldData.pages[0],
            notes: [newNote, ...(oldData.pages[0]?.notes ?? [])],
          },
          ...oldData.pages.slice(1),
        ],
      };
    });
  };

  const handleUserLogin = (value: boolean) => {
    setIsLoggedIn(value);
    if (value) {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
                        src="https://github.com/shadcn.png"
                        alt="shadcn"
                      />
                      <AvatarFallback>LR</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheckIcon />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCardIcon />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
              <div className="text-sm text-white font-light">Sreekanth T</div>
              <div className="text-xs text-slate-300 font-light">
                Sreekanthksy02@gmail.com
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
              👋Welcome Sreekanth!
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
              </div>
              <div className="flex-1 min-h-full max-h-full overflow-auto">
                {selectedView === "notes" && (
                  <Notes
                    notes={notes}
                    onUpdateNote={updateNote}
                    taskUpdateMutation={taskUpdateMutation}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onLoadMore={fetchNextPage}
                  />
                )}
                {selectedView === "calendar" && (
                  <NotesCalendarView
                    onUpdateNote={updateNote}
                    className="max-h-full overflow-y-scroll"
                  />
                )}
                {selectedView === "list" && (
                  <NotesListView notes={notes} onUpdateNote={updateNote} />
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
                  <Tasks tasks={tasks} mutation={taskUpdateMutation} />
                )}
                {selectedView === "calendar" && (
                  <TasksCalendarView
                    tasks={tasks}
                    mutation={taskUpdateMutation}
                    className="max-h-full overflow-y-scroll"
                  />
                )}
                {/* <Notes notes={notes} onUpdateNote={updateNote} /> */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
