/**
 * ============================================================
 * DUMMY DATA — Ganti dengan API call sesungguhnya nanti
 * ============================================================
 * File ini berisi semua data dummy yang dipakai di seluruh
 * halaman. Untuk mengganti ke API nyata, ubah file di:
 *   app/composables/use*.ts
 * dan hapus `default: () => dummyXxx` dari setiap useFetch.
 * ============================================================
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BusinessProfile {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  instagram?: string;
  logo?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

export interface Order {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  garmentType: string;
  description: string;
  measurements: Record<string, string>;
  status: "received" | "cutting" | "sewing" | "finishing" | "done";
  paymentStatus: "paid" | "unpaid" | "partial";
  totalPrice: number;
  paidAmount: number;
  deadline: string;
  createdAt: string;
  assignedTo?: string;
  notes?: string;
  log?: OrderLog[];
}

export interface OrderLog {
  id: number;
  status: string;
  note: string;
  employeeName: string;
  createdAt: string;
}

export interface OrderTracking {
  id: number;
  receiptNumber: string;
  customerName: string;
  garmentType: string;
  description: string | null;
  status: "received" | "cutting" | "sewing" | "finishing" | "done";
  paymentStatus: "paid" | "unpaid" | "partial";
  totalPrice: number;
  paidAmount: number;
  deadline: string;
  createdAt: string;
  log: OrderLog[];
}

export interface Employee {
  id: number;
  name: string;
  role: "cutting" | "sewing" | "finishing";
  status: "idle" | "working";
  phone: string;
  joinDate: string;
  completedToday: number;
  completedTotal: number;
  wagePerPiece: number;
}

export interface EmployeePerformance {
  employeeId: number;
  daily: { date: string; count: number }[];
  weekly: { week: string; count: number }[];
}

export interface Task {
  id: number;
  orderId: string;
  orderName: string;
  garmentType: string;
  step: string;
  priority: number;
  deadline: string;
  estimatedMinutes: number;
  assignedTo: number;
}

export interface DashboardSummary {
  activeOrders: number;
  weeklyRevenue: number;
  activeEmployees: number;
  overdueOrders: number;
}

export interface ReportData {
  monthlyOrders: { month: string; count: number }[];
  garmentTypes: { type: string; count: number }[];
  employeeWorkload: { employeeId: number; name: string; days: { day: string; hours: number }[] }[];
}

// ─── Dummy Data ────────────────────────────────────────────────────────────────

export const dummyBusiness: BusinessProfile = {
  name: "Penjahit Yan",
  slogan: "Jahitan berkualitas, detail sempurna, hasil memukau",
  address: "Jl. Kenanga, Kel. Napar, Payakumbuh Utara, Sumatera Barat",
  phone: "0812-6731-094",
  email: "yanpenjahit@gmail.com",
  hours: "Senin–Sabtu, 08:00–17:00 WIB",
  instagram: "@penjahit_yan",
};

export const dummyPortfolio: PortfolioItem[] = [
  {
    id: 1,
    title: "Kemeja Batik Tulis",
    category: "Kemeja",
    image: "https://placehold.co/600x600/17726d/ffffff?text=Kemeja+Batik",
    description: "Kemeja batik tulis dengan motif parang rusak, bahan katun primisima.",
  },
  {
    id: 2,
    title: "Jas Formal Pria",
    category: "Jas",
    image: "https://placehold.co/600x600/115652/ffffff?text=Jas+Formal",
    description: "Jas formal untuk pernikahan atau acara resmi, bahan wool italy.",
  },
  {
    id: 3,
    title: "Kebaya Modern",
    category: "Kebaya",
    image: "https://placehold.co/600x600/0e4441/ffffff?text=Kebaya+Modern",
    description: "Kebaya modern dengan payet jepang, cocok untuk wisuda.",
  },
  {
    id: 4,
    title: "Celana Formal",
    category: "Celana",
    image: "https://placehold.co/600x600/519592/ffffff?text=Celana+Formal",
    description: "Celana formal slim fit bahan tropical wool.",
  },
  {
    id: 5,
    title: "Gaun Pengantin",
    category: "Gaun",
    image: "https://placehold.co/600x600/8bb9b6/ffffff?text=Gaun+Pengantin",
    description: "Gaun pengantin elegan dengan detail bordir tangan.",
  },
  {
    id: 6,
    title: "Baju Koko Premium",
    category: "Koko",
    image: "https://placehold.co/600x600/c5dcdc/17726d?text=Baju+Koko",
    description: "Baju koko premium bahan toyobo, bordir motif Islami.",
  },
];

export const dummyOrders: Order[] = [
  {
    id: "ORD-001",
    receiptNumber: "RES-2024-001",
    customerName: "Ahmad Fauzan",
    customerPhone: "08123456789",
    garmentType: "Kemeja Batik",
    description: "Kemeja batik custom ukuran XL",
    measurements: { lingkarDada: "110cm", lingkarPinggang: "96cm", panjangBaju: "75cm" },
    status: "sewing",
    paymentStatus: "partial",
    totalPrice: 350000,
    paidAmount: 175000,
    deadline: "2024-02-28",
    createdAt: "2024-02-15",
    assignedTo: "Budi",
    log: [
      {
        id: 1,
        status: "received",
        note: "Pesanan diterima",
        employeeName: "Admin",
        createdAt: "2024-02-15 09:00",
      },
      {
        id: 2,
        status: "cutting",
        note: "Kain dipotong",
        employeeName: "Budi",
        createdAt: "2024-02-18 10:30",
      },
      {
        id: 3,
        status: "sewing",
        note: "Mulai dijahit",
        employeeName: "Siti",
        createdAt: "2024-02-20 08:00",
      },
    ],
  },
  {
    id: "ORD-002",
    receiptNumber: "RES-2024-002",
    customerName: "Siti Rahayu",
    customerPhone: "08567891234",
    garmentType: "Kebaya Modern",
    description: "Kebaya wisuda warna sage green",
    measurements: { lingkarBadan: "88cm", lingkarPinggang: "72cm", panjangBaju: "50cm" },
    status: "finishing",
    paymentStatus: "unpaid",
    totalPrice: 750000,
    paidAmount: 0,
    deadline: "2024-02-25",
    createdAt: "2024-02-10",
    log: [
      {
        id: 1,
        status: "received",
        note: "Pesanan masuk",
        employeeName: "Admin",
        createdAt: "2024-02-10 14:00",
      },
      {
        id: 2,
        status: "cutting",
        note: "Bahan dipotong",
        employeeName: "Rina",
        createdAt: "2024-02-13 09:00",
      },
      {
        id: 3,
        status: "sewing",
        note: "Dijahit oleh penjahit senior",
        employeeName: "Siti",
        createdAt: "2024-02-16 08:00",
      },
      {
        id: 4,
        status: "finishing",
        note: "Pemasangan payet",
        employeeName: "Dewi",
        createdAt: "2024-02-22 07:30",
      },
    ],
  },
  {
    id: "ORD-003",
    receiptNumber: "RES-2024-003",
    customerName: "Budi Santoso",
    customerPhone: "08798765432",
    garmentType: "Jas Formal",
    description: "Jas untuk pernikahan, warna navy",
    measurements: { lingkarDada: "102cm", panjangJas: "80cm", lebarBahu: "46cm" },
    status: "done",
    paymentStatus: "paid",
    totalPrice: 1500000,
    paidAmount: 1500000,
    deadline: "2024-02-20",
    createdAt: "2024-02-01",
  },
  {
    id: "ORD-004",
    receiptNumber: "RES-2024-004",
    customerName: "Dewi Lestari",
    customerPhone: "08211234567",
    garmentType: "Gaun Pesta",
    description: "Gaun untuk acara resepsi, warna burgundy",
    measurements: { lingkarBadan: "84cm", lingkarPinggang: "68cm", panjangGaun: "120cm" },
    status: "received",
    paymentStatus: "partial",
    totalPrice: 900000,
    paidAmount: 450000,
    deadline: "2024-03-05",
    createdAt: "2024-02-21",
  },
  {
    id: "ORD-005",
    receiptNumber: "RES-2024-005",
    customerName: "Rudi Hermawan",
    customerPhone: "08345678901",
    garmentType: "Celana Formal",
    description: "Celana slim fit untuk meeting, bahan tropical",
    measurements: { lingkarPinggang: "82cm", lingkarPinggul: "96cm", panjangCelana: "105cm" },
    status: "cutting",
    paymentStatus: "paid",
    totalPrice: 250000,
    paidAmount: 250000,
    deadline: "2024-02-26",
    createdAt: "2024-02-20",
  },
];

export const dummyEmployees: Employee[] = [
  {
    id: 1,
    name: "Budi Pranoto",
    role: "cutting",
    status: "working",
    phone: "08112233445",
    joinDate: "2021-03-15",
    completedToday: 3,
    completedTotal: 248,
    wagePerPiece: 15000,
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    role: "sewing",
    status: "working",
    phone: "08555667788",
    joinDate: "2020-07-01",
    completedToday: 2,
    completedTotal: 412,
    wagePerPiece: 25000,
  },
  {
    id: 3,
    name: "Rina Wulandari",
    role: "cutting",
    status: "idle",
    phone: "08765432109",
    joinDate: "2022-01-10",
    completedToday: 0,
    completedTotal: 187,
    wagePerPiece: 15000,
  },
  {
    id: 4,
    name: "Dewi Kusuma",
    role: "finishing",
    status: "working",
    phone: "08998877665",
    joinDate: "2019-11-20",
    completedToday: 4,
    completedTotal: 634,
    wagePerPiece: 20000,
  },
  {
    id: 5,
    name: "Agus Salim",
    role: "sewing",
    status: "idle",
    phone: "08443322110",
    joinDate: "2023-05-05",
    completedToday: 1,
    completedTotal: 89,
    wagePerPiece: 25000,
  },
];

export const dummyEmployeePerformance: Record<number, EmployeePerformance> = {
  1: {
    employeeId: 1,
    daily: [
      { date: "Sen", count: 4 },
      { date: "Sel", count: 3 },
      { date: "Rab", count: 5 },
      { date: "Kam", count: 2 },
      { date: "Jum", count: 4 },
      { date: "Sab", count: 3 },
    ],
    weekly: [
      { week: "Minggu 1", count: 18 },
      { week: "Minggu 2", count: 21 },
      { week: "Minggu 3", count: 19 },
      { week: "Minggu 4", count: 22 },
    ],
  },
  2: {
    employeeId: 2,
    daily: [
      { date: "Sen", count: 2 },
      { date: "Sel", count: 3 },
      { date: "Rab", count: 2 },
      { date: "Kam", count: 4 },
      { date: "Jum", count: 3 },
      { date: "Sab", count: 2 },
    ],
    weekly: [
      { week: "Minggu 1", count: 14 },
      { week: "Minggu 2", count: 16 },
      { week: "Minggu 3", count: 15 },
      { week: "Minggu 4", count: 18 },
    ],
  },
};

export const dummyDashboard: DashboardSummary = {
  activeOrders: 12,
  weeklyRevenue: 4750000,
  activeEmployees: 4,
  overdueOrders: 2,
};

export const dummyTrendData = {
  labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
  incoming: [8, 12, 10, 15],
  completed: [6, 10, 9, 13],
};

export const dummyReports: ReportData = {
  monthlyOrders: [
    { month: "Sep", count: 32 },
    { month: "Okt", count: 41 },
    { month: "Nov", count: 38 },
    { month: "Des", count: 55 },
    { month: "Jan", count: 47 },
    { month: "Feb", count: 29 },
  ],
  garmentTypes: [
    { type: "Kemeja", count: 45 },
    { type: "Kebaya", count: 30 },
    { type: "Jas", count: 25 },
    { type: "Celana", count: 20 },
    { type: "Gaun", count: 18 },
    { type: "Lainnya", count: 12 },
  ],
  employeeWorkload: dummyEmployees.map((emp) => ({
    employeeId: emp.id,
    name: emp.name,
    days: [
      { day: "Sen", hours: Math.floor(Math.random() * 8) + 1 },
      { day: "Sel", hours: Math.floor(Math.random() * 8) + 1 },
      { day: "Rab", hours: Math.floor(Math.random() * 8) + 1 },
      { day: "Kam", hours: Math.floor(Math.random() * 8) + 1 },
      { day: "Jum", hours: Math.floor(Math.random() * 8) + 1 },
      { day: "Sab", hours: Math.floor(Math.random() * 6) + 1 },
    ],
  })),
};

export const dummyMyTasks: Task[] = [
  {
    id: 1,
    orderId: "ORD-001",
    orderName: "Ahmad Fauzan",
    garmentType: "Kemeja Batik",
    step: "sewing",
    priority: 1,
    deadline: "2024-02-28",
    estimatedMinutes: 90,
    assignedTo: 2,
  },
  {
    id: 2,
    orderId: "ORD-004",
    orderName: "Dewi Lestari",
    garmentType: "Gaun Pesta",
    step: "cutting",
    priority: 2,
    deadline: "2024-03-05",
    estimatedMinutes: 60,
    assignedTo: 1,
  },
  {
    id: 3,
    orderId: "ORD-005",
    orderName: "Rudi Hermawan",
    garmentType: "Celana Formal",
    step: "cutting",
    priority: 3,
    deadline: "2024-02-26",
    estimatedMinutes: 45,
    assignedTo: 1,
  },
];

export const dummyCompletedTasks: Task[] = [
  {
    id: 10,
    orderId: "ORD-003",
    orderName: "Budi Santoso",
    garmentType: "Jas Formal",
    step: "sewing",
    priority: 1,
    deadline: "2024-02-20",
    estimatedMinutes: 120,
    assignedTo: 2,
  },
];

export const dummyNotifications = [
  {
    id: 1,
    type: "urgent",
    message: "Pesanan Siti Rahayu (RES-2024-002) jatuh tempo 3 hari lagi!",
    orderId: "ORD-002",
  },
  {
    id: 2,
    type: "warning",
    message: "Pesanan Rudi Hermawan (RES-2024-005) belum dimulai cutting.",
    orderId: "ORD-005",
  },
];
