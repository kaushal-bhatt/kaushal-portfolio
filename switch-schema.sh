#!/bin/bash

# Schema management script for dual database support
# Switches between SQLite (local) and PostgreSQL (production)

SQLITE_SCHEMA="prisma/schema.prisma"
POSTGRES_SCHEMA="prisma/schema.production.prisma"

# Function to switch to SQLite schema
use_sqlite() {
    echo "🔄 Switching to SQLite schema for local development..."
    
    # Ensure SQLite schema exists and has correct provider
    cat > $SQLITE_SCHEMA << 'EOF'
// SQLite schema for local development
generator client {
    provider = "prisma-client-js"
    output   = "./node_modules/@prisma/client"
}

datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
  blogPosts     BlogPost[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Portfolio {
  id            String   @id @default(cuid())
  company       String
  role          String
  startDate     String
  endDate       String?
  current       Boolean  @default(false)
  description   String
  technologies  String @default("")
  achievements  String @default("")
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model BlogPost {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String
  content     String
  technology  String
  published   Boolean  @default(false)
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  tags        String @default("")
  readTime    Int      @default(5)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TechSection {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  description String
  icon        String
  order       Int    @default(0)
  color       String @default("#3B82F6")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
EOF
    echo "✅ SQLite schema active"
}

# Function to switch to PostgreSQL schema  
use_postgres() {
    echo "🔄 Switching to PostgreSQL schema for production..."
    cp $POSTGRES_SCHEMA $SQLITE_SCHEMA
    echo "✅ PostgreSQL schema active"
}

# Main logic
case "$1" in
    "sqlite")
        use_sqlite
        ;;
    "postgres")  
        use_postgres
        ;;
    *)
        echo "Usage: $0 [sqlite|postgres]"
        echo "  sqlite   - Switch to SQLite for local development"
        echo "  postgres - Switch to PostgreSQL for production"
        exit 1
        ;;
esac
