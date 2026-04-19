-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT,
    "studentEmail" TEXT,
    "studentDept" TEXT,
    "rollNumber" TEXT,
    "year" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "urgency" INTEGER NOT NULL DEFAULT 3,
    "urgency_reason" TEXT,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_group" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Received',
    "status_history" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
