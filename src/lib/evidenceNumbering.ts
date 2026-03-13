// Evidence numbering — auto-generates unique references like EV-2026-001

const COUNTER_KEY = "evidence_counter";

function getCounter(): number {
  return parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10);
}

function incrementCounter(): number {
  const next = getCounter() + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

export function generateEvidenceNumber(): string {
  const year = new Date().getFullYear();
  const seq = incrementCounter();
  return `EV-${year}-${String(seq).padStart(3, "0")}`;
}

export function assignEvidenceNumbers(files: string[]): { file: string; evidenceRef: string }[] {
  return files.map((file) => ({
    file,
    evidenceRef: generateEvidenceNumber(),
  }));
}

// For display: generate deterministic evidence numbers from sample data (demo)
export function getDemoEvidenceNumber(sampleId: string, fileIndex: number): string {
  // Create a stable hash-like number from sampleId
  let hash = 0;
  for (let i = 0; i < sampleId.length; i++) {
    hash = ((hash << 5) - hash) + sampleId.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 900 + 1;
  const seq = base + fileIndex;
  return `EV-2026-${String(seq).padStart(3, "0")}`;
}
