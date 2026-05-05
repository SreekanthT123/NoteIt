import { useEffect, useState } from "react";

const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval); // cleanup (important)
  }, []);

  return (
    <div className="flex items-center leading-tight gap-2 ">
      <span className="text-sm text-slate-400">{formattedDate}</span>
      <span className="text-lg font-medium text-slate-700">
        {formattedTime}
      </span>
    </div>
  );
};

export default LiveClock;
