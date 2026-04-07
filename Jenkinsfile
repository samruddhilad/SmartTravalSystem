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
                echo "Installing dependencies"
                bat 'pip install -r requirements.txt'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t smart-travel .'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker run -d -p 5000:5000 smart-travel'
            }
        }

        stage('Test') {
            steps {
                echo "Running automated test"
                bat 'python test.py'
            }
        }

    }
}