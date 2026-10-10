"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Person, Volunteer } from "./data";

interface Ctx {
  people: Person[];
  volunteers: Volunteer[];
  helped: number;
  persistent: boolean;
  ready: boolean;
  lastSync: number;
  refresh: () => Promise<void>;
  post: (url: string, body: unknown) => Promise<any>;
  staff: { name: string; password: string } | null;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  staffAction: (action: string, data?: Record<string, unknown>) => Promise<boolean>;
  myVolunteerId: string | null;
  setMyVolunteerId: (id: string | null) => void;
}

const StoreCtx = createContext<Ctx | null>(null);
const POLL_MS = 4000;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [helped, setHelped] = useState(0);
  const [persistent, setPersistent] = useState(false);
  const [ready, setReady] = useState(false);
  const [lastSync, setLastSync] = useState(0);
  const [staff, setStaff] = useState<{ name: string; password: string } | null>(null);
  const [myVolunteerId, setMyVid] = useState<string | null>(null);
  const version = useRef(0);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const r = await fetch(`/api/state?v=${version.current}`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      setPersistent(Boolean(j.persistent));
      if (j.changed) {
        version.current = j.v;
        setPeople(j.people);
        setVolunteers(j.volunteers);
        setHelped(j.helped);
      }
      setLastSync(Date.now());
      setReady(true);
    } catch {
      /* tarmoq xatosi — keyingi urinishda qayta */
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("mehr-staff");
      if (s) setStaff(JSON.parse(s));
      setMyVid(localStorage.getItem("mehr-vid"));
    } catch {}
    refresh();
    const t = setInterval(refresh, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const post = useCallback(async (url: string, body: unknown) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "xato"), { status: r.status });
    version.current = 0; // keyingi poll to'liq yangilaydi
    refresh();
    return j;
  }, [refresh]);

  const login = useCallback(async (name: string, password: string) => {
    try {
      const j = await fetch("/api/staff", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", name, password }),
      }).then((r) => (r.ok ? r.json() : null));
      if (!j?.ok) return false;
      const s = { name, password };
      setStaff(s);
      sessionStorage.setItem("mehr-staff", JSON.stringify(s));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setStaff(null);
    sessionStorage.removeItem("mehr-staff");
  }, []);

  const staffAction = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    if (!staff) return false;
    try {
      await post("/api/staff", { ...staff, action, ...data });
      return true;
    } catch (e: any) {
      if (e?.status === 401) logout();
      return false;
    }
  }, [staff, post, logout]);

  const setMyVolunteerId = useCallback((id: string | null) => {
    setMyVid(id);
    try { id ? localStorage.setItem("mehr-vid", id) : localStorage.removeItem("mehr-vid"); } catch {}
  }, []);

  const value = useMemo<Ctx>(() => ({
    people, volunteers, helped, persistent, ready, lastSync, refresh, post,
    staff, login, logout, staffAction, myVolunteerId, setMyVolunteerId,
  }), [people, volunteers, helped, persistent, ready, lastSync, refresh, post, staff, login, logout, staffAction, myVolunteerId, setMyVolunteerId]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider yo'q");
  return c;
}

/** Rasmni brauzerda siqib (max 480px, JPEG) data-URL qaytaradi */
export function compressImage(file: File, max = 480, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("rasm o'qilmadi")); };
    img.src = url;
  });
}
