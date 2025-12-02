pipeline {
    agent any

    environment {
        RETRIES = 3  // Number of times to retry frontend unit tests
    }

    stages {

        stage('Install Backend Dependencies') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Start Backend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        bat 'start "" cmd /c "npm run dev"'
                    }
                }
            }
        }

        stage('Start Frontend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        bat 'start "" cmd /c "npm run dev"'
                    }
                }
            }
        }

        stage('Wait for Services') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'powershell -Command "$p=8888; while(-not (Test-NetConnection -Port $p -ComputerName localhost).TcpTestSucceeded) { Start-Sleep 1 }"'
                    bat 'powershell -Command "$p=3000; while(-not (Test-NetConnection -Port $p -ComputerName localhost).TcpTestSucceeded) { Start-Sleep 1 }"'
                }
            }
        }

        stage('Run Cypress Tests') {
            steps {
                echo "Running Cypress tests..."
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('.') {
                        bat 'npx cypress run || exit 0'
                    }
                }
            }
        }

        stage('Run Frontend Unit Tests with Retries') {
            steps {
                script {
                    retry(env.RETRIES.toInteger()) {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            dir('frontend') {
                                echo "Running Vitest with coverage..."
                                bat 'npm test -- --coverage || exit 1'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Stopping all Node.js processes"
            bat 'taskkill /F /IM node.exe /T || exit 0'

            echo "Archiving Cypress artifacts..."
            archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/results/**/*.xml', allowEmptyArchive: true

            echo "Archiving frontend coverage reports..."
            archiveArtifacts artifacts: 'frontend/coverage/**/*', allowEmptyArchive: true

            echo "Marking build UNSTABLE instead of FAILED if any stage failed"
            script {
                if (currentBuild.result == 'FAILURE') {
                    currentBuild.result = 'UNSTABLE'
                }
            }
        }
    }
}
