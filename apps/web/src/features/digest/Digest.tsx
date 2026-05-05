import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";

export const Digest = () => {
  const queryClient = useQueryClient();

  const { data: digest } = useQuery({
    queryKey: ["digest"],
    queryFn: async () => {
      const res = await api.get("/digest");
      return res.data.digest;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post("/digest/generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digest"] });
    },
  });

  return (
    <div className="p-4 border-t space-y-3">
      <h2 className="text-lg font-bold">Daily Digest</h2>

      <button
        className="bg-purple-500 text-white px-3 py-1"
        onClick={() => mutation.mutate()}
      >
        Generate Digest
      </button>

      {digest && (
        <div className="space-y-2">
          <p className="font-semibold">{digest.summary}</p>

          <div>
            <h3 className="text-sm font-bold">Highlights</h3>
            {digest.highlights.map((h: string, i: number) => (
              <p key={i} className="text-sm text-gray-600">
                - {h}
              </p>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold">Focus Areas</h3>
            <div className="flex gap-2">
              {digest.focusAreas.map((f: string) => (
                <span key={f} className="bg-gray-200 px-2 text-xs">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};