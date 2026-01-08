export type RockType = "Petoskey" | "Quartz" | "Copper" | "Agate" | "Other";

export type FindRow = {
  id: string;
  user_id: string;
  rock_type: RockType;
  note: string | null;
  photo_path: string;
  lat: number;
  lng: number;
  created_at: string;
};
