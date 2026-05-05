import { useEffect, useState } from "react";
import { api } from "../../api/client";

type Usage = {
  email: string;
  aiUsageCount: number;
  aiUsageLimit: number;
};

function AiUsage({ limitReached }: { limitReached: boolean }) {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      setUsage(res.data);
    });
  }, []);
  return (
    <div>
      {limitReached && (
        <div className="bg-red-500 px-2 rounded-md">
          <p className="text-white text-xs">AI limit reached for today</p>
        </div>
      )}
      <p className="text-orange-500 text-xs">
        AI Usage: {usage?.aiUsageCount} / {usage?.aiUsageLimit}
      </p>
    </div>
  );
}

export default AiUsage;
