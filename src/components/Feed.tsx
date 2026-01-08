import type { FindRow } from "../lib/types";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "./ui/card";

/**
 * The Feed component renders a list of finds. It expects the rows in
 * descending order by created_at and shows the image, type, note, and
 * coordinates. When no rows are provided it displays a placeholder.
 */
export function Feed({ rows }: { rows: FindRow[] }) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-green-50 p-3">
      <div className="text-lg font-extrabold text-gray-900 px-1">Recent Finds</div>
      <div className="mt-2 space-y-3">
        {rows.map((r) => {
          const url = supabase.storage.from("rock-photos").getPublicUrl(r.photo_path).data.publicUrl;
          return (
            <Card key={r.id}>
              <CardContent>
                <div className="flex gap-3">
                  <img
                    src={url}
                    className="h-20 w-20 rounded-xl object-cover border border-gray-100"
                    alt={r.rock_type}
                  />
                  <div className="flex-1">
                    <div className="font-bold">{r.rock_type}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                    {r.note && <div className="mt-1 text-sm text-gray-700">{r.note}</div>}
                    <div className="mt-1 text-xs text-gray-500">
                      {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <div className="text-sm text-gray-600 p-4">No finds yet.</div>
        )}
      </div>
    </div>
  );
}
