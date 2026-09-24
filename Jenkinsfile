pipeline {
    agent any

    environment {
        NETWORK = 'car-net'
    }

    stages {
        stage('Build Images') {
            steps {
                sh 'docker build -t car-backend ./backend'
                sh 'docker build -t car-frontend ./frontend'
            }
        }

        stage('Prepare Network') {
            steps {
                sh 'docker network create ${NETWORK} || true'
            }
        }

        stage('Run MySQL') {
            steps {
                withCredentials([string(credentialsId: 'mysql-root-password', variable: 'MYSQL_ROOT_PASSWORD')]) {
                    sh 'docker rm -f mysql || true'
                    sh '''
                        docker run -d --name mysql --network ${NETWORK} \
                          -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                          -e MYSQL_DATABASE=cars \
                          mysql:8
                    '''
                }
            }
        }

        stage('Wait for MySQL') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if docker exec mysql mysqladmin ping -h localhost --silent; then
                            echo "MySQL is ready"
                            exit 0
                        fi
                        echo "Waiting for MySQL..."
                        sleep 2
                    done
                    echo "MySQL did not become ready in time"
                    exit 1
                '''
            }
        }

        stage('Run Backend') {
            steps {
                withCredentials([string(credentialsId: 'mysql-root-password', variable: 'MYSQL_ROOT_PASSWORD')]) {
                    sh 'docker rm -f car-backend || true'
                    sh '''
                        docker run -d --name car-backend --network ${NETWORK} \
                          -p 2020:8080 \
                          -e SPRING_DATASOURCE_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                          car-backend
                    '''
                }
            }
        }

        stage('Run Frontend') {
            steps {
                sh 'docker rm -f car-frontend || true'
                sh 'docker run -d --name car-frontend --network ${NETWORK} -p 3000:3000 car-frontend'
            }
        }
    }
}
