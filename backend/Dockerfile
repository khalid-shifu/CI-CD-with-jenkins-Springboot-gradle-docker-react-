FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

COPY . .
RUN chmod +x gradlew
RUN ./gradlew build


FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/build/libs/car-api-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]


# with maven

#FROM eclipse-temurin:17-jdk AS builder
#WORKDIR /app

#COPY . .
#RUN ./mvnw package 

#FROM eclipse-temurin:17-jre
#WORKDIR /app
#COPY --from=builder /app/target/car-api-0.0.1-SNAPSHOT.jar app.jar
#ENTRYPOINT ["java", "-jar", "app.jar"]
