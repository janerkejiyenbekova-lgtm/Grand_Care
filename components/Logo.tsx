// GRANDCARE belgisi: yurak (g'amxo'rlik) va uni o'rab turgan himoya yoyi.
// Rang `currentColor` emas — yorug'/qorong'i rejimda ham bir xil ko'rinadi.
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="logo-svg">
      <rect width="64" height="64" rx="18" fill="#2550d8" />
      <path
        d="M32 46.5C16.5 36.8 13.5 29.6 13.5 24.6 13.5 18.6 18 14.5 23.6 14.5c3.6 0 6.5 1.9 8.4 4.9 1.9-3 4.8-4.9 8.4-4.9 5.6 0 10.1 4.1 10.1 10.1 0 5-3 12.2-18.5 21.9Z"
        fill="#ffffff"
      />
      <path d="M17 51.5c4.6-3.4 9.4-5 15-5s10.4 1.6 15 5" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <b>GRAND</b>
      <span>CARE</span>
    </span>
  );
}
