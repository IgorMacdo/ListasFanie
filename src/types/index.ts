export interface Gift {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_reserved: boolean;
  reserved_by: string | null;
  reserved_at: string | null;
  created_at: string;
  reserved_phone?: string | null;
  contribution_type?: string | null;
  buy_link?: string | null;
}

export interface EventSettings {
  id: number;
  couple_names: string;
  description: string;
  event_date: string;
  date_display: string;
  time_display: string;
  location_name: string;
  location_address: string;
  image_url: string;
}
