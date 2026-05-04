/* global process */

// CardinalXchange seeds no fixtures. The empty-state UX is part of the product
// (see CLAUDE.md and user memory). This file remains as a no-op shim so
// `prisma db seed` exits cleanly when invoked from packages/db/prisma.config.ts.
process.exit(0);
