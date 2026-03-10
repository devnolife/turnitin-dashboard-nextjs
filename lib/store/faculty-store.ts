import { create } from "zustand"
import type { StudyProgram, Faculty } from "@/lib/types/common"

export type { StudyProgram, Faculty } from "@/lib/types/common"

interface FacultyState {
  faculties: Faculty[]
  isLoading: boolean
  error: string | null
  fetchFaculties: () => Promise<void>
}

export const useFacultyStore = create<FacultyState>()((set) => ({
  faculties: [
    {
      id: "fac-1",
      name: "Fakultas Keguruan dan Ilmu Pendidikan",
      code: "FKIP",
      students: 3200,
      programs: [
        { id: "prog-1", name: "Pendidikan Guru Sekolah Dasar", degree: "bachelor", students: 680 },
        { id: "prog-2", name: "Pendidikan Bahasa Inggris", degree: "bachelor", students: 520 },
        { id: "prog-3", name: "Pendidikan Matematika", degree: "bachelor", students: 450 },
        { id: "prog-4", name: "Pendidikan Bahasa dan Sastra Indonesia", degree: "bachelor", students: 380 },
        { id: "prog-5", name: "Pendidikan Pancasila dan Kewarganegaraan", degree: "bachelor", students: 320 },
        { id: "prog-6", name: "Pendidikan Jasmani", degree: "bachelor", students: 280 },
        { id: "prog-7", name: "Pendidikan Fisika", degree: "bachelor", students: 290 },
        { id: "prog-8", name: "Pendidikan Biologi", degree: "bachelor", students: 280 },
      ],
    },
    {
      id: "fac-2",
      name: "Fakultas Teknik",
      code: "FT",
      students: 1800,
      programs: [
        { id: "prog-9", name: "Teknik Informatika", degree: "bachelor", students: 620 },
        { id: "prog-10", name: "Teknik Elektro", degree: "bachelor", students: 420 },
        { id: "prog-11", name: "Teknik Sipil", degree: "bachelor", students: 380 },
        { id: "prog-12", name: "Teknik Arsitektur", degree: "bachelor", students: 380 },
      ],
    },
    {
      id: "fac-3",
      name: "Fakultas Ekonomi dan Bisnis",
      code: "FEB",
      students: 1650,
      programs: [
        { id: "prog-13", name: "Manajemen", degree: "bachelor", students: 580 },
        { id: "prog-14", name: "Akuntansi", degree: "bachelor", students: 520 },
        { id: "prog-15", name: "Ekonomi Pembangunan", degree: "bachelor", students: 320 },
        { id: "prog-16", name: "Magister Manajemen", degree: "master", students: 230 },
      ],
    },
    {
      id: "fac-4",
      name: "Fakultas Kedokteran",
      code: "FK",
      students: 980,
      programs: [
        { id: "prog-17", name: "Pendidikan Dokter", degree: "bachelor", students: 420 },
        { id: "prog-18", name: "Ilmu Keperawatan", degree: "bachelor", students: 380 },
        { id: "prog-19", name: "Kesehatan Masyarakat", degree: "bachelor", students: 180 },
      ],
    },
    {
      id: "fac-5",
      name: "Fakultas Agama Islam",
      code: "FAI",
      students: 1420,
      programs: [
        { id: "prog-20", name: "Pendidikan Agama Islam", degree: "bachelor", students: 480 },
        { id: "prog-21", name: "Perbankan Syariah", degree: "bachelor", students: 320 },
        { id: "prog-22", name: "Hukum Ekonomi Syariah", degree: "bachelor", students: 350 },
        { id: "prog-23", name: "Komunikasi dan Penyiaran Islam", degree: "bachelor", students: 270 },
      ],
    },
    {
      id: "fac-6",
      name: "Fakultas Ilmu Sosial dan Ilmu Politik",
      code: "FISIP",
      students: 1100,
      programs: [
        { id: "prog-24", name: "Ilmu Komunikasi", degree: "bachelor", students: 420 },
        { id: "prog-25", name: "Ilmu Pemerintahan", degree: "bachelor", students: 380 },
        { id: "prog-26", name: "Ilmu Administrasi Negara", degree: "bachelor", students: 300 },
      ],
    },
    {
      id: "fac-7",
      name: "Fakultas Pertanian",
      code: "FP",
      students: 850,
      programs: [
        { id: "prog-27", name: "Agroteknologi", degree: "bachelor", students: 350 },
        { id: "prog-28", name: "Ilmu dan Teknologi Pangan", degree: "bachelor", students: 280 },
        { id: "prog-29", name: "Peternakan", degree: "bachelor", students: 220 },
      ],
    },
  ],
  isLoading: false,
  error: null,

  fetchFaculties: async () => {
    set({ isLoading: true, error: null })

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      set({ isLoading: false })
    } catch (error) {
      set({
        error: "Gagal memuat data fakultas. Silakan coba lagi.",
        isLoading: false,
      })
    }
  },
}))

