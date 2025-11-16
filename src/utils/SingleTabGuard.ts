/*
  Enforces a single active tab for the application using localStorage heartbeats.
  If another tab is active (recent heartbeat), this tab renders a blocking message.
*/

const DEFAULT_APP_NAME = "duck-game";
const HEARTBEAT_INTERVAL_MS = 1000; // how often we update our heartbeat
const HEARTBEAT_EXPIRY_MS = 4000;   // how long a heartbeat is considered "fresh"

function now(): number {
  return Date.now();
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export type SingleTabGuardOptions = {
  appName?: string;
  onBlockedRender?: () => void; // optional custom renderer for the blocked state
};

export function enforceSingleTab(options?: SingleTabGuardOptions): boolean {
  const appName = options?.appName ?? DEFAULT_APP_NAME;
  const LOCK_KEY = `${appName}:single-tab:lock`;
  const tabId = generateTabId();

  type Lock = { id: string; ts: number };

  // Guard against environments where localStorage is unavailable or throws
  const storageUsable = isLocalStorageUsable();
  if (!storageUsable) {
    // Fallback: cannot enforce single-tab reliably, allow app to start
    return true;
  }

  const readLock = (): Lock | null => safeParse<Lock>(safeLocalStorageGetItem(LOCK_KEY));
  const writeLock = (lock: Lock): void => safeLocalStorageSetItem(LOCK_KEY, JSON.stringify(lock));
  const clearLock = (): void => safeLocalStorageRemoveItem(LOCK_KEY);
  const isFresh = (ts: number): boolean => now() - ts < HEARTBEAT_EXPIRY_MS;

  const renderBlocked = () => {
    if (typeof options?.onBlockedRender === "function") {
      options.onBlockedRender();
      return;
    }
    // Minimal blocking UI without React
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = '';
    }
    const container = document.createElement("div");
    container.style.cssText = [
      "position:fixed",
      "inset:0",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "background:#0b1020",
      "color:#fff",
      "font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif",
      "text-align:center",
      "padding:24px",
    ].join(";");
    container.innerHTML = `
      <div>
        <div style="font-size:22px;font-weight:700;margin-bottom:8px;">Игра уже открыта в другой вкладке</div>
        <div style="opacity:.8;margin-bottom:16px;">Закройте другую вкладку с игрой, затем обновите эту страницу.</div>
        <button id="retry-single-tab" style="padding:10px 16px;border-radius:8px;border:none;background:#4f46e5;color:#fff;font-weight:600;cursor:pointer">Проверить снова</button>
      </div>
    `;
    document.body.appendChild(container);
    const btn = document.getElementById("retry-single-tab");
    if (btn) {
      btn.addEventListener("click", () => {
        // If the other tab was closed, attempting to acquire the lock will succeed
        const canStart = tryAcquire();
        if (canStart) {
          container.remove();
          // Hard reload to boot the app cleanly
          window.location.reload();
        }
      });
    }
  };

  const tryAcquire = (): boolean => {
    const current = readLock();
    if (current && isFresh(current.ts) && current.id !== tabId) {
      return false;
    }
    writeLock({ id: tabId, ts: now() });
    // Verify we own the lock after write
    const after = readLock();
    return !!after && after.id === tabId;
  };

  const ownLock = tryAcquire();
  if (!ownLock) {
    renderBlocked();
    return false;
  }

  // Heartbeat to keep ownership fresh
  const interval = window.setInterval(() => {
    const current = readLock();
    if (!current) {
      // lock was cleared elsewhere; reclaim it
      writeLock({ id: tabId, ts: now() });
      return;
    }
    if (current.id !== tabId && isFresh(current.ts)) {
      // another active tab took over; block this tab
      cleanup();
      renderBlocked();
      return;
    }
    // update our heartbeat if we still own it or it's stale
    writeLock({ id: tabId, ts: now() });
  }, HEARTBEAT_INTERVAL_MS);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== LOCK_KEY) return;
    const current = readLock();
    if (current && current.id !== tabId && isFresh(current.ts)) {
      cleanup();
      renderBlocked();
    }
  };
  window.addEventListener("storage", onStorage);

  const cleanup = () => {
    window.removeEventListener("storage", onStorage);
    window.clearInterval(interval);
    const current = readLock();
    if (current && current.id === tabId) {
      clearLock();
    }
  };

  window.addEventListener("beforeunload", () => {
    cleanup();
  });

  return true;
}

function generateTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

// ---- Safe localStorage helpers ----
function isLocalStorageUsable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const testKey = "__single_tab_guard_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function safeLocalStorageGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // swallow to avoid crashing on restricted environments
  }
}

function safeLocalStorageRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // swallow
  }
}
