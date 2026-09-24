pipeline {
    agent any

    stages {
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'chmod +x gradlew'
                    sh './gradlew build'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
    }
}
