-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "salt" DROP NOT NULL,
ALTER COLUMN "confirmationCode" DROP NOT NULL;