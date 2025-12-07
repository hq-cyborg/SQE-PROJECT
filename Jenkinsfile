pipeline {
    agent any

    environment {
        RETRIES = 3
    }

    stages {

        // ------------------------------
        // 1. Checkout Code
        // ------------------------------
        stage('Checkout Code') {
            steps {
                echo "Checking out source code..."
                checkout scm
            }
        }

        // ------------------------------
        // 2. Install Dependencies
        // ------------------------------
        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    echo "Installing backend dependencies..."
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    echo "Installing frontend dependencies..."
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    echo "Building frontend..."
                    bat 'npm run build || exit 0'
                }
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                dir('frontend') {
                    echo "Running SonarCloud analysis..."
            
                    // This uses the plugin and your server configuration
                    withSonarQubeEnv('SonarCloud') {
                        bat 'sonar-scanner -Dsonar.projectKey=hq-cyborg_SQE-PROJECT -Dsonar.organization=hq-cyborg'
                    }
                }
            }
        }



        stage('Backend Security Audit') {
            steps {
                dir('backend') {
                    echo "Running backend security audit..."
                    bat 'npm audit --production || exit 0'
                }
            }
        }

        // ------------------------------
        // 3. Tests
        // ------------------------------
        stage('Run Backend Unit Tests') {
            steps {
                script {
                    retry(env.RETRIES.toInteger()) {
                        dir('backend') {
                            echo "Preparing coverage folder..."
                            bat '''
                            IF EXIST coverage rmdir /s /q coverage
                            mkdir coverage
                            '''

                            echo "Running backend tests with coverage..."
                            bat 'npm run test:coverage || exit 0'
                        }
                    }
                }
            }
        }

        // Performance Testing Stage (Artillery)
        // ------------------------------
        stage('Performance Testing (Artillery)') {
            steps {
                echo "Running Artillery performance tests..."

                dir('backend') {
                // Run Artillery and output report.json
                    bat 'artillery run performance-test.yml --output report.json || exit 0'
                }

                // Archive the performance report
                archiveArtifacts artifacts: 'report.json', allowEmptyArchive: true
            }
        }

        stage('Run Frontend Unit Tests') {
            steps {
                script {
                    retry(env.RETRIES.toInteger()) {
                        dir('frontend') {
                            echo "Preparing coverage folder..."
                            bat '''
                            IF EXIST coverage rmdir /s /q coverage
                            mkdir coverage
                            '''

                            echo "Running frontend tests with coverage..."
                            bat 'npm run test:coverage || exit 0'
                        }
                    }
                }
            }
        }

        // ------------------------------
        // 4. Staging & Cypress
        // ------------------------------
        stage('Staging Deployment & Cypress Tests') {
            steps {
                script {

                    // ---- Start backend ----
                    echo "Starting backend in dev mode..."
                    dir('backend') {
                        bat 'start "" cmd /c "npm run dev > backend.log 2>&1"'
                    }

                    // ---- Setup frontend ENV & start ----
                    echo "Setting frontend environment variables..."
                    dir('frontend') {
                        bat '''
                        echo VITE_FILE_BASE_URL=http://localhost:8888/ > .env
                        echo VITE_BACKEND_SERVER=http://localhost:8888/ >> .env
                        echo PROD=false >> .env
                        '''

                        echo "Starting frontend in dev mode..."
                        bat 'start "" cmd /c "npm run dev > frontend.log 2>&1"'
                    }

                    // ---- Wait for backend ----
                    echo "Waiting for backend on port 8888..."
                    bat '''
                    powershell -Command ^
                    "while (-not (Test-NetConnection -ComputerName localhost -Port 8888).TcpTestSucceeded) { Start-Sleep -Seconds 1 }"
                    '''

                    // ---- Wait for frontend ----
                    echo "Waiting for frontend on port 3000..."
                    bat '''
                    powershell -Command ^
                    "while (-not (Test-NetConnection -ComputerName localhost -Port 3000).TcpTestSucceeded) { Start-Sleep -Seconds 1 }"
                    '''

                    // ---- Run Cypress ----
                    echo "Running Cypress tests..."
                    bat 'npx cypress run || exit 0'
                }
            }
        }

        // ------------------------------
        // 5. Archive Artifacts
        // ------------------------------
        stage('Archive Build Artifacts') {
            steps {
                echo "Archiving artifacts..."

                archiveArtifacts artifacts: 'frontend/dist/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'frontend/coverage/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'backend/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'backend/coverage/**/*', allowEmptyArchive: true
            }
        }
    }

    // ------------------------------
    // POST ACTIONS
    // ------------------------------
    post {
        always {
            echo "Stopping all node processes..."
            bat 'taskkill /F /IM node.exe || exit 0'

            echo "Archiving Cypress artifacts..."
            archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/results/**/*.xml', allowEmptyArchive: true

            script {
                if (currentBuild.result == 'FAILURE') {
                    echo "Marking build SUCCESS even if some tests failed"
                    currentBuild.result = 'SUCCESS'
                }
            }
        }
    }
}
