/**
 * Maps each valid file category (used as URL parameter `:type`)
 * to its corresponding physical directory on disk.
 *
 * To add support for a new file category, simply add a new entry here.
 */
export const FILE_TYPE_DIR_MAP: Record<string, string> = {
  // ── Readings ──────────────────────────────────────────────────────────────
  incidents: '/home/sigepaa/sigepaa/images/incidents',
  readings: '/home/sigepaa/sigepaa/images/readings',
  qrcodes: '/home/sigepaa/sigepaa/images/qrcodes',
  // ── Connections ───────────────────────────────────────────────────────────
  connections: '/home/sigepaa/sigepaa/images/connections',
  // ── Work Orders ───────────────────────────────────────────────────────────
  work_orders: '/home/sigepaa/sigepaa/images/work_orders',
  // ── Connection Documents (Receipts, etc) ──────────────────────────────────
  connection_documents:
    process.env.CONNECTION_DOCUMENTS_UPLOAD_DIR ||
    '/home/sigepaa/sigepaa/documents/connection-documents',
};
