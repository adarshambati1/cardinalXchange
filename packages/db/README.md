# packages/db

Prisma and Postgres ownership lives here.

This package owns the Prisma schema, migrations, generated client workflow, seed workflow, and database query helpers for CardinalXchange. It should be the only shared package that imports Prisma or knows the physical database schema.

Keep product orchestration in `apps/web/server`; keep this package focused on persistence.
