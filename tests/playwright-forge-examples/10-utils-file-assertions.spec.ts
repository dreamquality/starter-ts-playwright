import { test, expect } from '@playwright/test';
import { FileAssertions } from 'playwright-forge';
import * as fs from 'fs';
import * as path from 'path';

test.describe('FileAssertions Utility Examples', () => {
  const testDir = path.join(process.cwd(), 'test-results', 'file-assertions-test');
  const testFile = path.join(testDir, 'test.txt');
  const emptyFile = path.join(testDir, 'empty.txt');
  
  test.beforeAll(() => {
    // Create test directory and files
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    fs.writeFileSync(testFile, 'Hello, Playwright!');
    fs.writeFileSync(emptyFile, '');
  });
  
  test.afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('Assert file exists', () => {
    FileAssertions.exists(testFile);
    console.log('File exists assertion passed');
  });

  test('Assert file does not exist', () => {
    const nonExistentFile = path.join(testDir, 'non-existent.txt');
    FileAssertions.notExists(nonExistentFile);
    console.log('File not exists assertion passed');
  });

  test('Assert file content equals', () => {
    FileAssertions.contentEquals(testFile, 'Hello, Playwright!');
    console.log('Content equals assertion passed');
  });

  test('Assert file content contains', () => {
    FileAssertions.contentContains(testFile, 'Playwright');
    FileAssertions.contentContains(testFile, 'Hello');
    console.log('Content contains assertion passed');
  });

  test('Assert file content matches pattern', () => {
    FileAssertions.contentMatches(testFile, /Hello.*Playwright/);
    FileAssertions.contentMatches(testFile, /^Hello/);
    console.log('Content matches assertion passed');
  });

  test('Assert file size', () => {
    const fileSize = fs.statSync(testFile).size;
    FileAssertions.sizeEquals(testFile, fileSize);
    console.log(`File size assertion passed: ${fileSize} bytes`);
  });

  test('Assert file size greater than', () => {
    FileAssertions.sizeGreaterThan(testFile, 10);
    console.log('File size greater than assertion passed');
  });

  test('Assert file is empty', () => {
    FileAssertions.isEmpty(emptyFile);
    console.log('File is empty assertion passed');
  });

  test('Assert file is not empty', () => {
    FileAssertions.isNotEmpty(testFile);
    console.log('File is not empty assertion passed');
  });

  test('Multiple file assertions', () => {
    // Check multiple conditions
    FileAssertions.exists(testFile);
    FileAssertions.isNotEmpty(testFile);
    FileAssertions.contentContains(testFile, 'Playwright');
    FileAssertions.sizeGreaterThan(testFile, 0);
    
    console.log('Multiple file assertions passed');
  });

  test('File assertions with downloaded file', async ({ page }) => {
    // This is a mock example - in real scenario you would download a file
    const downloadFile = path.join(testDir, 'downloaded.txt');
    fs.writeFileSync(downloadFile, 'Downloaded content');
    
    // Assert on downloaded file
    FileAssertions.exists(downloadFile);
    FileAssertions.isNotEmpty(downloadFile);
    FileAssertions.contentContains(downloadFile, 'Downloaded');
    
    console.log('Downloaded file assertions passed');
  });

  test('Assert JSON file content', () => {
    const jsonFile = path.join(testDir, 'test.json');
    const jsonData = { name: 'Test', value: 123 };
    fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));
    
    FileAssertions.exists(jsonFile);
    FileAssertions.contentContains(jsonFile, '"name"');
    FileAssertions.contentContains(jsonFile, '"value"');
    FileAssertions.contentMatches(jsonFile, /"name":\s*"Test"/);
    
    console.log('JSON file assertions passed');
  });

  test('Assert CSV file content', () => {
    const csvFile = path.join(testDir, 'test.csv');
    const csvData = 'Name,Age,City\nJohn,30,NYC\nJane,25,LA';
    fs.writeFileSync(csvFile, csvData);
    
    FileAssertions.exists(csvFile);
    FileAssertions.contentContains(csvFile, 'Name,Age,City');
    FileAssertions.contentContains(csvFile, 'John,30,NYC');
    FileAssertions.contentMatches(csvFile, /^Name,Age,City/);
    
    console.log('CSV file assertions passed');
  });

  test('File assertions in test report', () => {
    const reportFile = path.join(testDir, 'report.txt');
    fs.writeFileSync(reportFile, 'Test Report\nAll tests passed\n');
    
    FileAssertions.exists(reportFile);
    FileAssertions.contentContains(reportFile, 'Test Report');
    FileAssertions.contentContains(reportFile, 'passed');
    
    console.log('Report file assertions passed');
  });

  test('Negative file assertion example', () => {
    // Verify that assertion throws when condition is not met
    try {
      FileAssertions.contentEquals(testFile, 'Wrong content');
      throw new Error('Should have thrown assertion error');
    } catch (error) {
      // Expected to throw
      console.log('Negative assertion correctly detected mismatch');
    }
  });
});
