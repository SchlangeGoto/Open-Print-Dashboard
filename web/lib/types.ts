// Domain models mirroring the API response shapes

export interface Filament {
  id: number;
  brand: string;
  material: string;
  color_name: string;
  color_hex: string;
  nozzle_temp_min: number | null;
  nozzle_temp_max: number | null;
  bed_temp: number | null;
  bambu_info_idx: string | null;
  notes: string | null;
  /** Computed by the API: total remaining grams across all spools */
  total_remaining_g?: number;
  /** Computed by the API: average price per kg from last 5 spools */
  avg_price_per_kg?: number | null;
}

export interface Spool {
  id: number;
  filament_id: number | null;
  total_weight_g: number;
  remaining_g: number;
  nfc_uid: string | null;
  active: boolean;
  price_per_kg: number | null;
  purchased_at: string | null;
  created_at: string;
  last_used_at: string | null;
  notes: string | null;
}

export interface PrintJob {
  id: number;
  spool_id: number | null;
  title: string;
  cover: string | null;
  weight: number | null;
  estimated_cost: number | null;
  duration_seconds: number | null;
  start_time: string | null;
  finished_at: string | null;
  /** 1 = unknown, 2 = finished, 3 = canceled, 4 = running */
  status: number | null;
  bambu_task_id: string | null;
  device_id: string;
  ams_detail_mapping: string | null;
}

export interface PrinterStatus {
  connected?: boolean;
  status?: string;
  gcode_state?: string;
  subtask_name?: string;
  mc_percent?: number;
  mc_remaining_time?: number;
  layer_num?: number;
  total_layer_num?: number;
  nozzle_temper?: number;
  nozzle_target_temper?: number;
  bed_temper?: number;
  bed_target_temper?: number;
  cooling_fan_speed?: number;
  spd_lvl?: number;
  spd_mag?: number;
}

export interface PrinterDevice {
  dev_id: string;
  name: string;
  dev_model_name?: string;
  online: boolean;
}

export interface Setting {
  key: string;
  value: string;
}

export interface SetupStatus {
  user_created: boolean;
  bambu_logged_in: boolean;
  printer_configured: boolean;
  setup_complete: boolean;
}
