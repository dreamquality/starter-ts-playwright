# CI/CD Integration Guide

This document provides guidance on integrating API and E2E tests into various CI/CD platforms.

## Table of Contents

1. [GitHub Actions](#github-actions)
2. [GitLab CI](#gitlab-ci)
3. [Jenkins](#jenkins)
4. [Azure DevOps](#azure-devops)
5. [CircleCI](#circleci)
6. [Environment Variables](#environment-variables)
7. [Best Practices](#best-practices)

## GitHub Actions

### Complete Workflow Example

Create `.github/workflows/tests.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  api-tests:
    name: API Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        
      - name: Run API tests
        run: npm run test:api
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          API_AUTH_TOKEN: ${{ secrets.API_AUTH_TOKEN }}
          CI: true
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: api-test-results
          path: |
            playwright-report/
            test-results/
            allure-results/
          retention-days: 30

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox webkit
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          CI: true
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-results
          path: |
            playwright-report/
            test-results/
            allure-results/
          retention-days: 30

  allure-report:
    name: Generate Allure Report
    needs: [api-tests, e2e-tests]
    if: always()
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Download API test results
        uses: actions/download-artifact@v3
        with:
          name: api-test-results
          path: allure-results/api
          
      - name: Download E2E test results
        uses: actions/download-artifact@v3
        with:
          name: e2e-test-results
          path: allure-results/e2e
          
      - name: Install dependencies
        run: npm ci
          
      - name: Generate Allure Report
        run: npm run allure-report
        
      - name: Upload Allure Report
        uses: actions/upload-artifact@v3
        with:
          name: allure-report
          path: allure-report/
          retention-days: 30
          
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./allure-report
```

### Matrix Strategy for Multiple Browsers

```yaml
jobs:
  test:
    name: Test on ${{ matrix.browser }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.browser }}
      - run: npx playwright test --project=${{ matrix.browser }}
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
image: mcr.microsoft.com/playwright:v1.40.0-jammy

stages:
  - test
  - report

variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"
  PLAYWRIGHT_BROWSERS_PATH: "$CI_PROJECT_DIR/ms-playwright"

cache:
  paths:
    - .npm
    - ms-playwright

before_script:
  - npm ci

api-tests:
  stage: test
  script:
    - npm run test:api
  variables:
    API_BASE_URL: $API_BASE_URL
    API_AUTH_TOKEN: $API_AUTH_TOKEN
    CI: "true"
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
      - allure-results/
    expire_in: 1 week
  timeout: 10m

e2e-tests:
  stage: test
  script:
    - npm run test:e2e
  variables:
    BASE_URL: $BASE_URL
    CI: "true"
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
      - allure-results/
    expire_in: 1 week
  timeout: 30m

allure-report:
  stage: report
  when: always
  dependencies:
    - api-tests
    - e2e-tests
  script:
    - npm run allure-report
  artifacts:
    paths:
      - allure-report/
    expire_in: 1 month
```

## Jenkins

Create `Jenkinsfile`:

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
        }
    }
    
    environment {
        CI = 'true'
        API_BASE_URL = credentials('api-base-url')
        API_AUTH_TOKEN = credentials('api-auth-token')
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('API Tests') {
            steps {
                sh 'npm run test:api'
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'API Test Report',
                        keepAll: true
                    ])
                }
            }
        }
        
        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'E2E Test Report',
                        keepAll: true
                    ])
                }
            }
        }
        
        stage('Allure Report') {
            steps {
                script {
                    allure([
                        includeProperties: false,
                        jdk: '',
                        properties: [],
                        reportBuildPolicy: 'ALWAYS',
                        results: [[path: 'allure-results']]
                    ])
                }
            }
        }
    }
    
    post {
        always {
            junit 'junit-results/*.xml'
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
        failure {
            emailext(
                subject: "Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Check console output at ${env.BUILD_URL}",
                recipientProviders: [developers(), requestor()]
            )
        }
    }
}
```

## Azure DevOps

Create `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  npm_config_cache: $(Pipeline.Workspace)/.npm

stages:
- stage: Test
  jobs:
  - job: APITests
    displayName: 'API Tests'
    timeoutInMinutes: 10
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - task: Cache@2
      inputs:
        key: 'npm | "$(Agent.OS)" | package-lock.json'
        path: $(npm_config_cache)
      displayName: 'Cache npm'
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: npx playwright install --with-deps chromium
      displayName: 'Install Playwright browsers'
    
    - script: npm run test:api
      displayName: 'Run API tests'
      env:
        API_BASE_URL: $(API_BASE_URL)
        API_AUTH_TOKEN: $(API_AUTH_TOKEN)
        CI: true
    
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'junit-results/*.xml'
        mergeTestResults: true
        testRunTitle: 'API Tests'
    
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: 'playwright-report'
        artifact: 'api-test-report'
  
  - job: E2ETests
    displayName: 'E2E Tests'
    timeoutInMinutes: 30
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - task: Cache@2
      inputs:
        key: 'npm | "$(Agent.OS)" | package-lock.json'
        path: $(npm_config_cache)
      displayName: 'Cache npm'
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: npx playwright install --with-deps
      displayName: 'Install Playwright browsers'
    
    - script: npm run test:e2e
      displayName: 'Run E2E tests'
      env:
        BASE_URL: $(BASE_URL)
        CI: true
    
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'junit-results/*.xml'
        mergeTestResults: true
        testRunTitle: 'E2E Tests'
    
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: 'playwright-report'
        artifact: 'e2e-test-report'

- stage: Report
  dependsOn: Test
  condition: always()
  jobs:
  - job: AllureReport
    displayName: 'Generate Allure Report'
    steps:
    - task: DownloadPipelineArtifact@2
      inputs:
        artifact: 'api-test-report'
        path: $(Pipeline.Workspace)/allure-results/api
    
    - task: DownloadPipelineArtifact@2
      inputs:
        artifact: 'e2e-test-report'
        path: $(Pipeline.Workspace)/allure-results/e2e
    
    - script: |
        npm ci
        npm run allure-report
      displayName: 'Generate Allure Report'
    
    - task: PublishPipelineArtifact@1
      inputs:
        targetPath: 'allure-report'
        artifact: 'allure-report'
```

## CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

orbs:
  node: circleci/node@5.0

executors:
  playwright:
    docker:
      - image: mcr.microsoft.com/playwright:v1.40.0-jammy
    resource_class: large

jobs:
  api-tests:
    executor: playwright
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run API tests
          command: npm run test:api
          environment:
            CI: "true"
      - store_test_results:
          path: junit-results
      - store_artifacts:
          path: playwright-report
      - store_artifacts:
          path: allure-results

  e2e-tests:
    executor: playwright
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run E2E tests
          command: npm run test:e2e
          environment:
            CI: "true"
      - store_test_results:
          path: junit-results
      - store_artifacts:
          path: playwright-report
      - store_artifacts:
          path: allure-results

  allure-report:
    executor: playwright
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Generate Allure Report
          command: npm run allure-report
      - store_artifacts:
          path: allure-report

workflows:
  test:
    jobs:
      - api-tests:
          context: test-secrets
      - e2e-tests:
          context: test-secrets
      - allure-report:
          requires:
            - api-tests
            - e2e-tests
```

## Environment Variables

### Required Variables

Set these environment variables in your CI/CD platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL for API testing | `https://api.example.com` |
| `API_AUTH_TOKEN` | Authentication token | `Bearer xyz123...` |
| `API_USERNAME` | API username (if needed) | `test_user` |
| `API_PASSWORD` | API password (if needed) | `secure_password` |
| `BASE_URL` | Base URL for E2E tests | `https://example.com` |
| `CI` | CI environment flag | `true` |

### Setting Variables in Different Platforms

#### GitHub Actions
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add name and value

#### GitLab CI
1. Go to Settings → CI/CD → Variables
2. Click "Add variable"
3. Add key and value

#### Jenkins
1. Manage Jenkins → Credentials
2. Add credentials
3. Use in Jenkinsfile with `credentials('id')`

#### Azure DevOps
1. Pipeline → Edit → Variables
2. Add new variable
3. Mark as secret if needed

## Best Practices

### 1. Separate Test Suites

Run API and E2E tests as separate jobs for better parallelization:

```yaml
jobs:
  - api-tests    # Fast, runs first
  - e2e-tests    # Slower, can run in parallel
```

### 2. Use Caching

Cache dependencies to speed up builds:

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 3. Fail Fast Strategy

Set `fail-fast: false` for matrix builds to see all failures:

```yaml
strategy:
  fail-fast: false
  matrix:
    browser: [chromium, firefox, webkit]
```

### 4. Retry Failed Tests

Configure retries in `playwright.config.ts`:

```typescript
retries: process.env.CI ? 2 : 0
```

### 5. Parallel Execution

Run tests in parallel for faster execution:

```typescript
workers: process.env.CI ? 4 : undefined
```

### 6. Timeout Configuration

Set appropriate timeouts:

```yaml
timeout-minutes: 30
```

### 7. Artifact Management

Always upload artifacts for debugging:

```yaml
- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: test-results
    path: playwright-report/
```

### 8. Notifications

Set up notifications for test failures:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
```

### 9. Scheduled Runs

Run tests on a schedule:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

### 10. Test Reports

Publish test reports for easy access:

```yaml
- name: Publish Report
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
```

## Troubleshooting

### Common Issues

**Browser installation fails:**
```bash
npx playwright install --with-deps
```

**Tests timeout in CI:**
- Increase timeout values
- Check network latency
- Verify CI resources

**Environment variables not available:**
- Check variable names match exactly
- Verify secrets are set in CI platform
- Check variable scope (project/pipeline level)

**Allure report generation fails:**
- Ensure allure-commandline is installed
- Check JAVA_HOME is set
- Verify allure-results directory exists

## Support

For CI/CD specific issues:
- Check your platform's documentation
- Review pipeline logs
- Verify environment configuration

---

**Happy CI/CD! 🚀**
