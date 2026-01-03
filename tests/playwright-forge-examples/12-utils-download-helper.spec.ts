import { test, expect } from '@playwright/test';
import { waitForDownload, getDownloadPath } from 'playwright-forge';
import * as fs from 'fs';

test.describe('Download Helper Examples', () => {
  test('Wait for download and get path', async ({ page }) => {
    // Navigate to a page with download
    await page.goto('https://playwright.dev');
    
    // Note: This is a demonstration - playwright.dev may not have actual downloads
    // In real tests, you would click a download button
    
    console.log('Download helper utilities are available for file downloads');
    
    // Example usage (not executed):
    // const downloadPromise = waitForDownload(page);
    // await page.click('#download-button');
    // const download = await downloadPromise;
    // const filePath = await getDownloadPath(download);
  });

  test('Download file pattern example', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Simulate download handling
    page.on('download', async download => {
      const fileName = download.suggestedFilename();
      console.log(`Download detected: ${fileName}`);
      
      // Get download path
      // const path = await getDownloadPath(download);
      // console.log(`Downloaded to: ${path}`);
    });
    
    console.log('Download event listener configured');
  });

  test('Multiple downloads handling', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const downloads: string[] = [];
    
    page.on('download', async download => {
      downloads.push(download.suggestedFilename());
      console.log(`Download ${downloads.length}: ${download.suggestedFilename()}`);
    });
    
    // In real scenario, you would trigger downloads here
    console.log('Ready to handle multiple downloads');
  });

  test('Download with timeout handling', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Example of download with timeout
    const timeout = 30000; // 30 seconds
    
    console.log(`Download timeout set to ${timeout}ms`);
    
    // In real scenario:
    // const download = await waitForDownload(page, { timeout });
  });

  test('Download and verify file', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Example pattern for download verification
    page.on('download', async download => {
      const fileName = download.suggestedFilename();
      
      // Wait for download to complete
      // const path = await getDownloadPath(download);
      
      // Verify file exists
      // if (fs.existsSync(path)) {
      //   console.log(`Download verified: ${fileName}`);
      // }
      
      console.log(`Download pattern configured for: ${fileName}`);
    });
  });

  test('Download with custom save path', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Example of custom download path
    page.on('download', async download => {
      const fileName = download.suggestedFilename();
      
      // Save to custom path
      // const customPath = path.join(__dirname, 'downloads', fileName);
      // await download.saveAs(customPath);
      
      console.log(`Custom download path pattern configured`);
    });
  });

  test('Download PDF example', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Example of handling PDF downloads
    page.on('download', async download => {
      const fileName = download.suggestedFilename();
      
      if (fileName.endsWith('.pdf')) {
        console.log(`PDF download detected: ${fileName}`);
        
        // Handle PDF download
        // const path = await getDownloadPath(download);
        // Verify PDF
      }
    });
  });

  test('Download CSV example', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Example of handling CSV downloads
    page.on('download', async download => {
      const fileName = download.suggestedFilename();
      
      if (fileName.endsWith('.csv')) {
        console.log(`CSV download detected: ${fileName}`);
        
        // Handle CSV download
        // const path = await getDownloadPath(download);
        // Parse and verify CSV content
      }
    });
  });

  test('Download with progress tracking', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Example of tracking download progress
    page.on('download', async download => {
      console.log('Download started:', download.suggestedFilename());
      
      // Wait for download to complete
      // const path = await download.path();
      // console.log('Download completed:', path);
      
      // Check download state
      // const failure = await download.failure();
      // if (failure) {
      //   console.error('Download failed:', failure);
      // }
    });
  });

  test('Download and cleanup', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const downloadedFiles: string[] = [];
    
    page.on('download', async download => {
      // const path = await getDownloadPath(download);
      // downloadedFiles.push(path);
      
      console.log('Download tracked for cleanup');
    });
    
    // Cleanup after test
    // downloadedFiles.forEach(file => {
    //   if (fs.existsSync(file)) {
    //     fs.unlinkSync(file);
    //   }
    // });
  });

  test('Download helper utility documentation', () => {
    console.log(`
Download Helper Utilities from playwright-forge:

1. waitForDownload(page, options?)
   - Waits for a download to start
   - Returns download object
   - Options: timeout

2. getDownloadPath(download)
   - Gets the path where file was downloaded
   - Returns file path string

Example Usage:
  const downloadPromise = waitForDownload(page);
  await page.click('#download-button');
  const download = await downloadPromise;
  const filePath = await getDownloadPath(download);
  console.log('Downloaded to:', filePath);
    `);
  });
});
