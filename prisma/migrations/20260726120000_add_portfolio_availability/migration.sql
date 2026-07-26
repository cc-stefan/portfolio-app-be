CREATE TABLE "portfolio_availability" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "available_for_collaboration" BOOLEAN NOT NULL DEFAULT true,
    "available_from" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_availability_pkey" PRIMARY KEY ("id")
);

INSERT INTO "portfolio_availability" (
    "id",
    "available_for_collaboration",
    "available_from",
    "updated_at"
)
VALUES (1, true, NULL, CURRENT_TIMESTAMP);
