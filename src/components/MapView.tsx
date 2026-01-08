import { useEffect, useMemo, useRef, useState } from "react";
import type { FindRow, RockType } from "../lib/types";
import { supabase } from "../lib/supabase";
import { ROCK_TYPES, pinColor } from "../lib/rocks";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

type Props = {
  userId: string;
  finds: FindRow[];
  onCreated: (row: FindRow) => void; // optimistic optional
};

const MI_CENTER = { lat: 44.8, lng: -85.5 };

function loadGoogleMaps(apiKey: string) {
  if ((window as any).google?.maps) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

/**
 * MapView renders a Google map with existing finds as pins and a floating action
 * button to add a new find. It manages marker lifecycle, selection state and
 * uploading new finds to Supabase storage and table.
 */
export function MapView({ userId, finds, onCreated }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const [selected, setSelected] = useState<FindRow | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [rockType, setRockType] = useState<RockType>("Petoskey");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  useEffect(() => {
    (async () => {
      await loadGoogleMaps(mapsKey);
      if (!mapRef.current || mapObj.current) return;

      mapObj.current = new (window as any).google.maps.Map(mapRef.current, {
        center: MI_CENTER,
        zoom: 7,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
    })();
  }, [mapsKey]);

  // update markers whenever finds change
  useEffect(() => {
    if (!mapObj.current || !(window as any).google?.maps) return;

    // remove markers that no longer exist
    const ids = new Set(finds.map((f) => f.id));
    for (const [id, marker] of markersRef.current.entries()) {
      if (!ids.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    }

    // add new markers
    for (const f of finds) {
      if (markersRef.current.has(f.id)) continue;

      const marker = new (window as any).google.maps.Marker({
        position: { lat: f.lat, lng: f.lng },
        map: mapObj.current,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: pinColor(f.rock_type),
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => setSelected(f));
      markersRef.current.set(f.id, marker);
    }
  }, [finds]);

  async function getLocationOnce() {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function onOpenAdd() {
    try {
      const loc = await getLocationOnce();
      setGeo(loc);
      setIsAddOpen(true);
    } catch {
      alert("Need location permission to drop a pin.");
    }
  }

  async function saveFind() {
    if (!photoFile || !geo) return;
    setSaving(true);
    try {
      const fileExt = photoFile.name.split(".").pop() || "jpg";
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: upErr } = await supabase.storage
        .from("rock-photos")
        .upload(fileName, photoFile, { upsert: false });

      if (upErr) throw upErr;

      // create a public URL even if the bucket is private – returns signed URL when private
      const { data: pub } = supabase.storage.from("rock-photos").getPublicUrl(fileName);

      const insert = {
        user_id: userId,
        rock_type: rockType,
        note: note.trim() || null,
        photo_path: fileName,
        lat: geo.lat,
        lng: geo.lng,
      };

      const { data, error } = await supabase
        .from("finds")
        .insert(insert)
        .select()
        .single();

      if (error) throw error;

      onCreated(data as any);

      // reset form
      setPhotoFile(null);
      setNote("");
      setRockType("Petoskey");
      setIsAddOpen(false);
      alert("Saved!");
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // compute image URL for selected find
  const selectedPhotoUrl = useMemo(() => {
    if (!selected) return "";
    return supabase.storage.from("rock-photos").getPublicUrl(selected.photo_path).data.publicUrl;
  }, [selected]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Floating + button */}
      <div className="absolute right-4 bottom-24">
        <Button
          className="h-16 w-16 rounded-full bg-green-600 text-2xl shadow-lg"
          onClick={onOpenAdd}
          title="Add a find"
        >
          +
        </Button>
      </div>

      {/* Selected pin card */}
      {selected && (
        <div className="absolute left-3 right-3 bottom-3">
          <Card>
            <CardContent>
              <div className="flex gap-3">
                <img
                  src={selectedPhotoUrl}
                  className="h-20 w-20 rounded-xl object-cover border border-gray-100"
                  alt={selected.rock_type}
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{selected.rock_type}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(selected.created_at).toLocaleString()}
                  </div>
                  {selected.note && (
                    <div className="mt-1 text-sm text-gray-700 line-clamp-2">{selected.note}</div>
                  )}
                  <div className="mt-3">
                    <Button className="bg-gray-900" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add modal (simple, no extras) */}
      {isAddOpen && (
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="w-full rounded-t-3xl bg-white p-4">
            <div className="text-lg font-extrabold">New Find</div>
            <div className="text-xs text-gray-500">Live photo + rock type + optional note.</div>

            <div className="mt-3">
              <label className="text-sm font-semibold">Photo (camera)</label>
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
              <div className="mt-1 text-xs text-gray-500">
                Note: phones may still show “Choose existing” — best effort via capture mode.
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm font-semibold">Rock type</label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm"
                value={rockType}
                onChange={(e) => setRockType(e.target.value as RockType)}
              >
                {ROCK_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className="text-sm font-semibold">Note (optional)</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm"
                rows={2}
                placeholder="Short note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                className="w-1/2 bg-gray-200 text-gray-900"
                onClick={() => setIsAddOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="w-1/2 bg-green-600"
                onClick={saveFind}
                disabled={!photoFile || saving}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
