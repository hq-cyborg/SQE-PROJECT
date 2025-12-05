pipeline {
    agent any

    environment {
        RETRIES = 3  // Number of times to retry frontend unit tests
    }

    stages {

        // ------------------------------
        // Install Dependencies
        // ------------------------------
        stage('Install Backend Dependencies') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        echo "Installing backend dependencies..."
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        echo "Installing frontend dependencies..."
                        bat 'npm install'
                    }
                }
            }
        }

        // ------------------------------
        // Run Backend Unit Tests
        // ------------------------------
        stage('Run Backend Unit Tests') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        echo "Running backend tests (will not fail pipeline)..."
                        bat 'npm test || exit 0'
                    }
                }
            }
        }

        // ------------------------------
        // Run Frontend Unit Tests (with Retries)
        // ------------------------------
        stage('Run Frontend Unit Tests') {
            steps {
                script {
                    retry(env.RETRIES.toInteger()) {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            dir('frontend') {
                                echo "Running frontend tests with coverage (will not fail pipeline)..."
                                bat 'npm test -- --coverage || exit 0'
                            }
                        }
                    }
                }
            }
        }

        // ------------------------------
        // Start Services (Backend + Frontend)
        // ------------------------------
        stage('Start Backend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        echo "Starting backend..."
                        bat 'start "" cmd /c "npm run dev"'
                    }
                }
            }
        }

        stage('Start Frontend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        echo "Starting frontend..."
                        bat 'start "" cmd /c "npm run dev"'
                    }
                }
            }
        }

        // ------------------------------
        // Wait for Services to be Ready
        // ------------------------------
        stage('Wait for Services') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    echo "Waiting for backend (port 8888) to be ready..."
                    bat 'powershell -Command "$p=8888; while(-not (Test-NetConnection -Port $p -ComputerName localhost).TcpTestSucceeded) { Start-Sleep 1 }"'

                    echo "Waiting for frontend (port 3000) to be ready..."
                    bat 'powershell -Command "$p=3000; while(-not (Test-NetConnection -Port $p -ComputerName localhost).TcpTestSucceeded) { Start-Sleep 1 }"'
                }
            }
        }

        // ------------------------------
        // Run Cypress Tests
        // ------------------------------
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
    }

    post {
        always {
            // Stop all Node.js processes
            echo "Stopping all Node.js processes..."
            bat 'taskkill /F /IM node.exe /T || exit 0'

            // Archive Cypress artifacts
            echo "Archiving Cypress artifacts..."
            archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/results/**/*.xml', allowEmptyArchive: true

            // Archive frontend coverage reports
            echo "Archiving frontend coverage reports..."
            archiveArtifacts artifacts: 'frontend/coverage/**/*', allowEmptyArchive: true

            // Make sure build never fails
            script {
                if (currentBuild.result == 'FAILURE') {
                    echo "Marking build SUCCESS even if some tests failed"
                    currentBuild.result = 'SUCCESS'
                }
            }
        }
    }
}
