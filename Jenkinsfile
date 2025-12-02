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
                dir('backend') {
                    bat 'start "" cmd /c "npm run dev"'
                }
            }
        }

        stage('Start Frontend') {
            steps {
                dir('frontend') {
                    bat 'start "" cmd /c "npm run dev"'
                }
            }
        }

        stage('Wait for Services') {
            steps {
                bat '''
                powershell -Command "$portBackend=8888; 
                while(-not (Test-NetConnection -ComputerName localhost -Port $portBackend).TcpTestSucceeded){Start-Sleep -Seconds 1}"

                powershell -Command "$portFrontend=3000; 
                while(-not (Test-NetConnection -ComputerName localhost -Port $portFrontend).TcpTestSucceeded){Start-Sleep -Seconds 1}"
                '''
            }
        }

        stage('Run Cypress Tests') {
            steps {
                // ❗ Do not fail the build, always continue
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    dir('.') {
                        bat 'npx cypress run'
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Stopping services and running unit tests..."

            // 🛑 Always stop Node processes
            bat 'taskkill /F /IM node.exe /T || exit 0'

            // 🧪 Always run frontend tests even if Cypress failed
            dir('frontend') {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    bat 'npm test'
                }
            }
        }
    }
}
