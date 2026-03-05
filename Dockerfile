# ── Stage 1: Build the React frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build the Spring Boot backend ─────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build

WORKDIR /app

# Copy pom.xml first (layer caching - only re-download deps if pom changes)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Copy the built frontend into Spring Boot's static resources
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

# Build the JAR, skip tests (tests need a running DB)
RUN mvn clean package -DskipTests -B

# ── Stage 3: Runtime image ─────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create the uploads directory
RUN mkdir -p /app/uploads/resumes && chown -R appuser:appgroup /app/uploads

# Copy the built JAR
COPY --from=backend-build /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

# Expose port (Render uses PORT env variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]

