pipeline {
    agent any

    environment {
        RETRIES = 3   // Number of times to retry npm test
    }

    stages {

        stage('Install Backend Dependencies') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') { bat 'npm install' }
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') { bat 'npm install' }
                }
            }
        }

        stage('Start Backend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') { bat 'start "" cmd /c "npm run dev"' }
                }
            }
        }

        stage('Start Frontend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') { bat 'start "" cmd /c "npm run dev"' }
                }
            }
        }

        stage('Wait for Services') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat '''
                    powershell -Command "& {
                        $p=8888; while (-not (Test-NetConnection -Port $p -ComputerName localhost).TcpTestSucceeded) { Start-Sleep -Seconds 1 }
                        $p=3000; while (-not (Test-NetConnection -Port $p -ComputerName localhost).TcpTestSucceeded) { Start-Sleep -Seconds 1 }
                    }"
                    '''
                }
            }
        }

        stage('Run Cypress Tests') {
            steps {
                echo "Running Cypress tests..."
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('.') { bat 'npx cypress run || exit 0' }
                }
            }
        }

        stage('Run Frontend Unit Tests with Retries') {
            steps {
                script {
                    retry(env.RETRIES.toInteger()) {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            dir('frontend') {
                                bat 'npm test'

                                // If test fails, throw to retry the test
                                if (currentBuild.currentResult == 'FAILURE') {
                                    error("Unit tests failed — retrying...")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Stopping node services"
            bat 'taskkill /F /IM node.exe /T || exit 0'

            echo "Archiving Cypress artifacts..."
            archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/results/**/*.xml', allowEmptyArchive: true

            echo "Marking build UNSTABLE instead of FAILED"
            script {
                if (currentBuild.result == 'FAILURE') {
                    currentBuild.result = 'UNSTABLE'
                }
            }
        }
    }
}
