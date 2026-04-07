pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/samruddhilad/SmartTravalSystem'
            }
        }

        stage('Build') {
            steps {
                echo "Installing Python dependencies"
                bat '"C:\\Users\\naren\\AppData\\Local\\Programs\\Python\\Python312\\python.exe" -m pip install -r requirements.txt'
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker Image"
                bat 'docker build -t smart-travel-planner .'
            }
        }

        stage('Deploy') {
            steps {
                echo "Running Docker Container"
                bat 'docker run -d -p 5000:5000 smart-travel-planner'
            }
        }

        stage('Test') {
            steps {
                echo "Running Test Script"
                bat '"C:\\Users\\naren\\AppData\\Local\\Programs\\Python\\Python312\\python.exe" test.py'
            }
        }

    }
}