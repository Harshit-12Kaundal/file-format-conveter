/*
  Warnings:

  - Changed the type of `type` on the `FileConversion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConversionType" AS ENUM ('PDF_TO_DOCX', 'DOCX_TO_PDF', 'MERGE_PDF', 'COMPRESS_PDF', 'ASK_AI');

-- AlterTable
ALTER TABLE "FileConversion" DROP COLUMN "type",
ADD COLUMN     "type" "ConversionType" NOT NULL;
