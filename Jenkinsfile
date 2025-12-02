pipeline {
    agent any

    stages {

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Start Backend') {
            steps {
                echo 'Starting backend on port 8888...'
                dir('backend') {
                    bat 'start "" cmd /c "npm run dev"'
                }
            }
        }

        stage('Start Frontend') {
            steps {
                echo 'Starting frontend on port 3000...'
                dir('frontend') {
                    bat 'start "" cmd /c "npm run dev"'
                }
            }
        }

        stage('Wait for Services') {
            steps {
                echo 'Waiting for backend and frontend to be ready...'
                bat '''
                powershell -Command "$portBackend=8888; while(-not (Test-NetConnection -ComputerName localhost -Port $portBackend).TcpTestSucceeded){Start-Sleep -Seconds 1}"
                powershell -Command "$portFrontend=3000; while(-not (Test-NetConnection -ComputerName localhost -Port $portFrontend).TcpTestSucceeded){Start-Sleep -Seconds 1}"
                '''
            }
        }

        stage('Run Cypress Tests') {
            steps {
                echo 'Running Cypress tests...'
                dir('.') {  // run from ROOT where cypress.config.js exists
                    bat 'npx cypress run'
                }
            }
        }

        stage('Stop Backend and Frontend') {
            steps {
                echo 'Stopping backend and frontend...'
                bat 'taskkill /F /IM node.exe /T'
            }
        }

        stage('Run Frontend Unit Tests') {
            steps {
                echo 'Running frontend unit tests (npm test)...'
                dir('frontend') {    // run Jest/Vitest here
                    bat 'npm test'
                }
            }
        }
    }
}
