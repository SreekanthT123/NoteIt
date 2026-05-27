import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";

function AiUsage({ limitReached }: { limitReached: boolean }) {
  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
    enabled: !!localStorage.getItem("token"),
  });

  return (
    <div>
      {limitReached && (
        <div className="bg-red-500 px-2 rounded-md">
          <p className="text-white text-xs">AI limit reached for today</p>
        </div>
      )}
      <p className="text-orange-500 text-xs">
        AI Usage: {data?.aiUsageCount ?? "—"} / {data?.aiUsageLimit ?? "—"}
      </p>
    </div>
  );
}

export default AiUsage;
