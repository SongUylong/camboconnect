-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactUrlPrivacy" "PrivacyLevel" NOT NULL DEFAULT 'ONLY_ME',
ADD COLUMN     "educationPrivacy" "PrivacyLevel" NOT NULL DEFAULT 'ONLY_ME',
ADD COLUMN     "experiencePrivacy" "PrivacyLevel" NOT NULL DEFAULT 'ONLY_ME',
ADD COLUMN     "skillsPrivacy" "PrivacyLevel" NOT NULL DEFAULT 'ONLY_ME';
