// ─── DEMO MOCK DATA ─────────────────────────────────────────────────────────
// All static data used when DEMO_MODE is enabled in api.ts

export const DEMO_PRINTERS = [
  {
    dev_id: "01P09C450400001",
    name: "X1 Carbon",
    dev_model_name: "Bambu Lab X1 Carbon",
    online: true,
  },
  {
    dev_id: "01P09C350200002",
    name: "P1S Garage",
    dev_model_name: "Bambu Lab P1S",
    online: false,
  },
];

export const DEMO_PRINTER_STATUS = {
  gcode_state: "RUNNING",
  mc_percent: 47,
  mc_remaining_time: 83,
  subtask_name: "voronoi_vase.3mf",
  nozzle_temper: 220,
  nozzle_target_temper: 220,
  bed_temper: 65,
  bed_target_temper: 65,
  cooling_fan_speed: 7,
  spd_lvl: 2,
  spd_mag: 100,
  connected: true,
};

export const DEMO_FILAMENTS = [
  {
    id: 1, brand: "Bambu Lab", material: "PLA", color_name: "Bambu Green",
    color_hex: "#22c55e", nozzle_temp_min: 190, nozzle_temp_max: 230, bed_temp: 35,
    bambu_info_idx: "GFL00", notes: null, total_remaining_g: 1420, avg_price_per_kg: 24.99,
  },
  {
    id: 2, brand: "Bambu Lab", material: "PLA", color_name: "Galaxy Black",
    color_hex: "#1f2937", nozzle_temp_min: 190, nozzle_temp_max: 230, bed_temp: 35,
    bambu_info_idx: "GFL01", notes: null, total_remaining_g: 380, avg_price_per_kg: 24.99,
  },
  {
    id: 3, brand: "Polymaker", material: "PLA", color_name: "Polar White",
    color_hex: "#f1f5f9", nozzle_temp_min: 195, nozzle_temp_max: 225, bed_temp: 40,
    bambu_info_idx: "GFL02", notes: null, total_remaining_g: 2200, avg_price_per_kg: 19.90,
  },
  {
    id: 4, brand: "Bambu Lab", material: "PETG", color_name: "Ocean Blue",
    color_hex: "#3b82f6", nozzle_temp_min: 230, nozzle_temp_max: 260, bed_temp: 75,
    bambu_info_idx: "GFG99", notes: null, total_remaining_g: 670, avg_price_per_kg: 27.99,
  },
  {
    id: 5, brand: "Hatchbox", material: "ABS", color_name: "Signal Red",
    color_hex: "#ef4444", nozzle_temp_min: 220, nozzle_temp_max: 250, bed_temp: 100,
    bambu_info_idx: "GFA00", notes: "Needs enclosure", total_remaining_g: 900, avg_price_per_kg: 22.50,
  },
  {
    id: 6, brand: "Prusament", material: "PLA", color_name: "Prusa Orange",
    color_hex: "#f97316", nozzle_temp_min: 215, nozzle_temp_max: 230, bed_temp: 60,
    bambu_info_idx: "GFL05", notes: null, total_remaining_g: 1760, avg_price_per_kg: 29.99,
  },
  {
    id: 7, brand: "Bambu Lab", material: "TPU", color_name: "Mist Gray",
    color_hex: "#9ca3af", nozzle_temp_min: 220, nozzle_temp_max: 240, bed_temp: 35,
    bambu_info_idx: "GFU01", notes: "Flex material", total_remaining_g: 430, avg_price_per_kg: 34.99,
  },
  {
    id: 8, brand: "eSUN", material: "ASA", color_name: "Matte Black",
    color_hex: "#374151", nozzle_temp_min: 240, nozzle_temp_max: 260, bed_temp: 95,
    bambu_info_idx: "GFL99", notes: "UV resistant", total_remaining_g: 1050, avg_price_per_kg: 26.00,
  },
];

export const DEMO_SPOOLS = [
  {
    id: 1, filament_id: 1, total_weight_g: 1000, remaining_g: 820,
    nfc_uid: "04:A2:3F:2B", active: false, price_per_kg: 24.99,
    purchased_at: "2026-03-03T12:00:00Z", created_at: "2026-03-03T12:00:00Z",
    last_used_at: "2026-04-29T10:30:00Z", notes: null,
  },
  {
    id: 2, filament_id: 1, total_weight_g: 1000, remaining_g: 600,
    nfc_uid: null, active: false, price_per_kg: 24.99,
    purchased_at: "2026-03-18T12:00:00Z", created_at: "2026-03-18T12:00:00Z",
    last_used_at: "2026-04-25T14:20:00Z", notes: null,
  },
  {
    id: 3, filament_id: 2, total_weight_g: 1000, remaining_g: 380,
    nfc_uid: "04:B1:2A:FF", active: true, price_per_kg: 24.99,
    purchased_at: "2026-04-02T12:00:00Z", created_at: "2026-04-02T12:00:00Z",
    last_used_at: "2026-05-02T09:45:00Z", notes: null,
  },
  {
    id: 4, filament_id: 3, total_weight_g: 1000, remaining_g: 1000,
    nfc_uid: null, active: false, price_per_kg: 19.90,
    purchased_at: "2026-04-22T12:00:00Z", created_at: "2026-04-22T12:00:00Z",
    last_used_at: null, notes: "Unopened",
  },
  {
    id: 5, filament_id: 3, total_weight_g: 1000, remaining_g: 750,
    nfc_uid: null, active: false, price_per_kg: 19.90,
    purchased_at: "2026-04-12T12:00:00Z", created_at: "2026-04-12T12:00:00Z",
    last_used_at: "2026-04-27T16:00:00Z", notes: null,
  },
  {
    id: 6, filament_id: 3, total_weight_g: 1000, remaining_g: 450,
    nfc_uid: null, active: false, price_per_kg: 19.90,
    purchased_at: "2026-01-31T12:00:00Z", created_at: "2026-01-31T12:00:00Z",
    last_used_at: "2026-04-20T11:00:00Z", notes: null,
  },
  {
    id: 7, filament_id: 4, total_weight_g: 1000, remaining_g: 670,
    nfc_uid: null, active: false, price_per_kg: 27.99,
    purchased_at: "2026-04-07T12:00:00Z", created_at: "2026-04-07T12:00:00Z",
    last_used_at: "2026-04-26T09:00:00Z", notes: null,
  },
  {
    id: 8, filament_id: 5, total_weight_g: 1000, remaining_g: 900,
    nfc_uid: null, active: false, price_per_kg: 22.50,
    purchased_at: "2026-03-23T12:00:00Z", created_at: "2026-03-23T12:00:00Z",
    last_used_at: null, notes: null,
  },
  {
    id: 9, filament_id: 6, total_weight_g: 1000, remaining_g: 880,
    nfc_uid: null, active: false, price_per_kg: 29.99,
    purchased_at: "2026-04-17T12:00:00Z", created_at: "2026-04-17T12:00:00Z",
    last_used_at: "2026-04-30T14:00:00Z", notes: null,
  },
  {
    id: 10, filament_id: 6, total_weight_g: 1000, remaining_g: 880,
    nfc_uid: null, active: false, price_per_kg: 29.99,
    purchased_at: "2026-04-27T12:00:00Z", created_at: "2026-04-27T12:00:00Z",
    last_used_at: null, notes: null,
  },
  {
    id: 11, filament_id: 7, total_weight_g: 500, remaining_g: 430,
    nfc_uid: null, active: false, price_per_kg: 34.99,
    purchased_at: "2026-03-28T12:00:00Z", created_at: "2026-03-28T12:00:00Z",
    last_used_at: "2026-04-18T10:00:00Z", notes: null,
  },
  {
    id: 12, filament_id: 8, total_weight_g: 1000, remaining_g: 1050,
    nfc_uid: null, active: false, price_per_kg: 26.00,
    purchased_at: "2026-04-24T12:00:00Z", created_at: "2026-04-24T12:00:00Z",
    last_used_at: null, notes: null,
  },
  {
    id: 13, filament_id: 1, total_weight_g: 1000, remaining_g: 0,
    nfc_uid: null, active: false, price_per_kg: 24.99,
    purchased_at: "2025-12-31T12:00:00Z", created_at: "2025-12-31T12:00:00Z",
    last_used_at: "2026-04-12T09:00:00Z", notes: "Empty",
  },
];

export const DEMO_PRINTS = [
  // 2 active / running prints
  {
    id: 1, spool_id: 3, title: "Voronoi Vase — Large", cover: "https://makerworld.bblmw.com/makerworld/cache/2/US24d5f8ca13c8d2/221036170/3mf/1/REP1/Metadata/plate_1.png",
    weight: 102, estimated_cost: 2.29, duration_seconds: 10800,
    start_time: "2026-05-02T07:32:00Z", finished_at: null, status: 4,
    bambu_task_id: "task_001", device_id: "01P09C450400001",
    mc_percent: 47, mc_remaining_time: 83,
  },
  {
    id: 2, spool_id: 1, title: "Cable Management Clip × 8", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/USe14e0f19a062dc/740581433/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=ae64001c9c19219cc4beb7e01c93e6bd76038a4e4dbee7a99228630d366e2c5a",
    weight: 30, estimated_cost: 0.58, duration_seconds: 5400,
    start_time: "2026-05-02T08:10:00Z", finished_at: null, status: 4,
    bambu_task_id: "task_002", device_id: "01P09C450400001",
    mc_percent: 31, mc_remaining_time: 142,
  },
  // Finished prints
  {
    id: 3, spool_id: 3, title: "Gridfinity Bin 2×4", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/US5f3a05bf640d02/655903906/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=bb6406ea8ac2f6d689a12aec09c9ea17c725cbbafea69c34eaf2d37bab1ca500",
    weight: 87, estimated_cost: 2.18, duration_seconds: 7200,
    start_time: "2026-04-30T09:00:00Z", finished_at: "2026-04-30T11:00:00Z", status: 2,
    bambu_task_id: "task_003", device_id: "01P09C450400001",
  },
  {
    id: 4, spool_id: 5, title: "Phone Stand — Adjustable", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/USa312a9c6a69cfe/712256182/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=9ce7ec9c352403e4f4e0aeeffee70c8856dc51cc9d527c7204b29843f99f8a75",
    weight: 52, estimated_cost: 1.03, duration_seconds: 5400,
    start_time: "2026-04-29T14:00:00Z", finished_at: "2026-04-29T15:30:00Z", status: 2,
    bambu_task_id: "task_004", device_id: "01P09C450400001",
  },
  {
    id: 5, spool_id: 7, title: "Parametric Shelf Bracket", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/US45c7d113813d5f/655551521/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=24df9b7d1f92182579759da04b5c7bbf64186d8aa88b8e15c7fe1f4cba67d4b6",
    weight: 124, estimated_cost: 3.47, duration_seconds: 10800,
    start_time: "2026-04-28T10:00:00Z", finished_at: "2026-04-28T13:00:00Z", status: 2,
    bambu_task_id: "task_005", device_id: "01P09C450400001",
  },
  {
    id: 6, spool_id: 2, title: "Raspberry Pi 5 Case", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/US4396c660eb9e93/651090055/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=4a21d0a331170953dc08e42cb1ece4e097be97cd573d27153e901665439b220f",
    weight: 96, estimated_cost: 2.40, duration_seconds: 9000,
    start_time: "2026-04-27T08:00:00Z", finished_at: "2026-04-27T10:30:00Z", status: 2,
    bambu_task_id: "task_006", device_id: "01P09C450400001",
  },
  {
    id: 7, spool_id: 11, title: "Flexible Drain Gasket", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/US2874edfc0299d5/654131310/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=08aeedab0377c7dbfc7373138575a209d55927aa8d5eb146027fb0f0e244efe2",
    weight: 34, estimated_cost: 1.19, duration_seconds: 3600,
    start_time: "2026-04-26T16:00:00Z", finished_at: "2026-04-26T17:00:00Z", status: 2,
    bambu_task_id: "task_007", device_id: "01P09C450400001",
  },
  {
    id: 8, spool_id: 9, title: "Miniature D&D Dungeon Tile", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/USe09d75b91a2f4a/654848409/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=990b9d7758e57ff264078e2df3f97b08d97920e3da9ab598248d417cf41486db",
    weight: 23, estimated_cost: 0.69, duration_seconds: 4500,
    start_time: "2026-04-25T20:00:00Z", finished_at: "2026-04-25T21:15:00Z", status: 2,
    bambu_task_id: "task_008", device_id: "01P09C450400001",
  },
  // Canceled prints
  {
    id: 9, spool_id: 6, title: "Vase Mode Cylinder — Draft", cover: "https://makerworld.bblmw.com/makerworld/cache/2/US24d5f8ca13c8d2/221036170/3mf/1/REP1/Metadata/plate_1.png",
    weight: 12, estimated_cost: 0.24, duration_seconds: 1200,
    start_time: "2026-04-24T11:00:00Z", finished_at: "2026-04-24T11:20:00Z", status: 3,
    bambu_task_id: "task_009", device_id: "01P09C450400001",
  },
  {
    id: 10, spool_id: 1, title: "Articulated Dragon — Test Print", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/USf07e4c84809f9e/653491266/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=951322f12dd21936bbd60fd20f62d4c41944262c0b7a32ae896943ffd3d79e05",
    weight: 8, estimated_cost: 0.20, duration_seconds: 900,
    start_time: "2026-04-23T09:00:00Z", finished_at: "2026-04-23T09:15:00Z", status: 3,
    bambu_task_id: "task_010", device_id: "01P09C450400001",
  },
  // More finished
  {
    id: 11, spool_id: 8, title: "65\" TV Wall Bracket — Part A", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/US99bfd2d86421ed/650900666/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=eeceff4a249c7c23623480fc88583cb768968763bbbcedfa4cd2acf291004f1b",
    weight: 210, estimated_cost: 4.73, duration_seconds: 18000,
    start_time: "2026-04-22T08:00:00Z", finished_at: "2026-04-22T13:00:00Z", status: 2,
    bambu_task_id: "task_011", device_id: "01P09C450400001",
  },
  {
    id: 12, spool_id: 5, title: "Desk Organiser — Modular v3", cover: "https://or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com/private/USe14e0f19a062dc/740581433/3mf/Metadata/plate_1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAXY6FH2ERJ3UALUNL%2F20260505%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260505T062453Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=ae64001c9c19219cc4beb7e01c93e6bd76038a4e4dbee7a99228630d366e2c5a",
    weight: 178, estimated_cost: 3.54, duration_seconds: 14400,
    start_time: "2026-04-20T10:00:00Z", finished_at: "2026-04-20T14:00:00Z", status: 2,
    bambu_task_id: "task_012", device_id: "01P09C450400001",
  },
];

export const DEMO_SETTINGS = [
  { key: "printer_ip", value: "192.168.1.42" },
  { key: "printer_serial", value: "01P09C450400001" },
  { key: "printer_access_code", value: "12345678" },
  { key: "bambu_cloud_token", value: "demo_token" },
  { key: "bambu_cloud_email", value: "demo@example.com" },
];

export const DEMO_FIRMWARE = {
  firmware: [
    { name: "ota", version: "01.08.04.00" },
    { name: "ahb", version: "00.00.05.66" },
    { name: "esp32", version: "01.03.01.00" },
    { name: "ams", version: "00.00.07.88" },
  ],
};