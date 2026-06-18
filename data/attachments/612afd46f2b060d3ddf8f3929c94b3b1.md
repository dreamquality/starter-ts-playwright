# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-search.spec.ts >> Testing search on playwright documentation page
- Location: tests/test-search.spec.ts:7:5

# Error details

```
Error: The title with name "Empty results" and locator p.DocSearch-Help is not visible

expect(locator).toBeVisible() failed

Locator: locator('p.DocSearch-Help')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - The title with name "Empty results" and locator p.DocSearch-Help is not visible with timeout 5000ms
  - waiting for locator('p.DocSearch-Help')

```

```yaml
- button "Search" [expanded]:
  - banner:
    - text: Search
    - searchbox "Search"
    - button "Cancel":
      - img
  - contentinfo:
    - link "Powered by Algolia":
      - /url: https://www.algolia.com/ref/docsearch/?utm_source=playwright.dev&utm_medium=referral&utm_content=powered_by&utm_campaign=docsearch
      - text: Powered by
      - img "Algolia"
    - list:
      - listitem:
        - img "Arrow down"
        - img "Arrow up"
        - text: Navigate
      - listitem:
        - img "Enter key"
        - text: Select
      - listitem: ESC Close
- region "Skip to main content":
  - link "Skip to main content":
    - /url: "#__docusaurus_skipToContent_fallback"
- navigation "Main":
  - link "Playwright logo Playwright":
    - /url: /
    - img "Playwright logo"
    - text: Playwright
  - link "Docs":
    - /url: /docs/intro
  - link "MCP":
    - /url: /mcp/introduction
  - link "CLI":
    - /url: /agent-cli/introduction
  - link "API":
    - /url: /docs/api/class-playwright
  - button "Node.js"
  - link "GitHub repository":
    - /url: https://github.com/microsoft/playwright
  - link "Discord server":
    - /url: https://aka.ms/playwright/discord
  - button "Switch between dark and light mode (currently system mode)"
  - button "Search (Control+k)": Search Ctrl K
- banner:
  - heading "Playwright enables reliable web automation for testing, scripting, and AI agents." [level=1]
  - paragraph:
    - text: One API to drive Chromium, Firefox, and WebKit — in your tests, your scripts, and your agent workflows. Available for
    - link "TypeScript":
      - /url: https://playwright.dev/docs/intro
    - text: ","
    - link "Python":
      - /url: https://playwright.dev/python/docs/intro
    - text: ","
    - link ".NET":
      - /url: https://playwright.dev/dotnet/docs/intro
    - text: ", and"
    - link "Java":
      - /url: https://playwright.dev/java/docs/intro
    - text: .
  - link "Get started":
    - /url: /docs/intro
  - link "Star microsoft/playwright on GitHub":
    - /url: https://github.com/microsoft/playwright
    - text: Star
  - link "91k+ stargazers on GitHub":
    - /url: https://github.com/microsoft/playwright/stargazers
    - text: 91k+
- main:
  - heading "Playwright Test" [level=3]
  - paragraph: Full-featured test runner with auto-waiting, assertions, tracing, and parallelism across Chromium, Firefox, and WebKit.
  - code: npm init playwright@latest
  - link "Testing documentation":
    - /url: /docs/intro
  - heading "Playwright CLI" [level=3]
  - paragraph: Token-efficient browser automation for coding agents like Claude Code and GitHub Copilot. Skill-based workflows without large context overhead.
  - code: npm i -g @playwright/cli@latest
  - link "CLI documentation":
    - /url: /docs/getting-started-cli
  - heading "Playwright MCP" [level=3]
  - paragraph: Model Context Protocol server that gives AI agents full browser control through structured accessibility snapshots.
  - code: npx @playwright/mcp@latest
  - link "MCP documentation":
    - /url: /docs/getting-started-mcp
  - heading "Built for testing" [level=2]
  - heading "Auto-wait and web-first assertions" [level=4]
  - paragraph: Playwright waits for elements to be actionable before performing actions. Assertions automatically retry until conditions are met. No artificial timeouts, no flaky tests.
  - heading "Test isolation" [level=4]
  - paragraph: Each test gets a fresh browser context — equivalent to a brand new browser profile. Full isolation with near-zero overhead. Save authentication state once and reuse it across tests.
  - heading "Resilient locators" [level=4]
  - paragraph:
    - text: "Find elements with selectors that mirror how users see the page:"
    - code: getByRole
    - text: ","
    - code: getByLabel
    - text: ","
    - code: getByPlaceholder
    - text: ","
    - code: getByTestId
    - text: . No brittle CSS paths.
  - heading "Parallelism and sharding" [level=4]
  - paragraph: Tests run in parallel by default across all configured browsers. Shard across multiple machines for faster CI. Full cross-browser coverage on every commit.
  - heading "Built for AI agents" [level=2]
  - heading "Accessibility snapshots, not screenshots" [level=4]
  - paragraph: Agents interact with pages through structured accessibility trees — element roles, names, and refs. Deterministic and unambiguous, no vision models required.
  - heading "MCP server" [level=4]
  - paragraph:
    - text: Drop-in
    - link "Model Context Protocol":
      - /url: https://modelcontextprotocol.io
    - text: server for VS Code, Cursor, Claude Desktop, Windsurf, and any MCP client. Full browser control through standard tool calls.
  - heading "CLI for coding agents" [level=4]
  - paragraph: Token-efficient command-line interface with installable skills. Purpose-built for Claude Code, GitHub Copilot, and similar coding agents that need to balance browser automation with large codebases.
  - heading "Session monitoring" [level=4]
  - paragraph: Visual dashboard with live screencast previews of all running browser sessions. Click any session to zoom in and take control.
  - heading "Powerful tooling" [level=2]
  - heading "Test generator" [level=4]:
    - link "Test generator":
      - /url: docs/codegen
  - paragraph: Record your actions in the browser and Playwright writes the test code. Generate assertions from the recording toolbar. Pick locators by clicking on elements.
  - heading "Trace Viewer" [level=4]:
    - link "Trace Viewer":
      - /url: docs/trace-viewer-intro
  - paragraph: Full timeline of test execution with DOM snapshots, network requests, console logs, and screenshots at every step. Investigate failures without re-running.
  - heading "VS Code extension" [level=4]:
    - link "VS Code extension":
      - /url: docs/getting-started-vscode
  - paragraph: Run, debug, and generate tests directly in the editor. Set breakpoints, live-inspect locators in the browser, and view full execution traces in the sidebar.
  - img "Chromium, Firefox, WebKit"
  - paragraph:
    - text: Any browser. Any platform. Chromium, Firefox, and WebKit on Linux, macOS, and Windows. Headless and headed. Also available for
    - link "Python":
      - /url: https://playwright.dev/python/docs/intro
    - text: ","
    - link ".NET":
      - /url: https://playwright.dev/dotnet/docs/intro
    - text: ", and"
    - link "Java":
      - /url: https://playwright.dev/java/docs/intro
    - text: .
  - heading "Chosen by companies and open source projects" [level=2]
  - list:
    - listitem:
      - link "VS Code":
        - /url: https://code.visualstudio.com
        - img "VS Code"
    - listitem:
      - link "Bing":
        - /url: https://bing.com
        - img "Bing"
    - listitem:
      - link "Outlook":
        - /url: https://outlook.com
        - img "Outlook"
    - listitem:
      - link "Disney+ Hotstar":
        - /url: https://www.hotstar.com/
        - img "Disney+ Hotstar"
    - listitem:
      - link "Material UI":
        - /url: https://github.com/mui-org/material-ui
        - img "Material UI"
    - listitem:
      - link "ING":
        - /url: https://github.com/ing-bank/lion
        - img "ING"
    - listitem:
      - link "Adobe":
        - /url: https://github.com/adobe/spectrum-web-components
        - img "Adobe"
    - listitem:
      - link "React Navigation":
        - /url: https://github.com/react-navigation/react-navigation
        - img "React Navigation"
    - listitem:
      - link "Accessibility Insights":
        - /url: https://accessibilityinsights.io/
        - img "Accessibility Insights"
- contentinfo:
  - text: Learn
  - list:
    - listitem:
      - link "Getting started":
        - /url: /docs/intro
    - listitem:
      - link "Playwright Training(opens in new tab)":
        - /url: https://learn.microsoft.com/en-us/training/modules/build-with-playwright/
        - text: Playwright Training
        - img "(opens in new tab)"
    - listitem:
      - link "Learn Videos":
        - /url: /community/learn-videos
    - listitem:
      - link "Feature Videos":
        - /url: /community/feature-videos
  - text: Community
  - list:
    - listitem:
      - link "Stack Overflow(opens in new tab)":
        - /url: https://stackoverflow.com/questions/tagged/playwright
        - text: Stack Overflow
        - img "(opens in new tab)"
    - listitem:
      - link "Discord(opens in new tab)":
        - /url: https://aka.ms/playwright/discord
        - text: Discord
        - img "(opens in new tab)"
    - listitem:
      - link "Twitter(opens in new tab)":
        - /url: https://twitter.com/playwrightweb
        - text: Twitter
        - img "(opens in new tab)"
    - listitem:
      - link "LinkedIn(opens in new tab)":
        - /url: https://www.linkedin.com/company/playwrightweb
        - text: LinkedIn
        - img "(opens in new tab)"
  - text: More
  - list:
    - listitem:
      - link "GitHub(opens in new tab)":
        - /url: https://github.com/microsoft/playwright
        - text: GitHub
        - img "(opens in new tab)"
    - listitem:
      - link "YouTube(opens in new tab)":
        - /url: https://www.youtube.com/channel/UC46Zj8pDH5tDosqm1gd7WTg
        - text: YouTube
        - img "(opens in new tab)"
    - listitem:
      - link "Blog(opens in new tab)":
        - /url: https://dev.to/playwright
        - text: Blog
        - img "(opens in new tab)"
    - listitem:
      - link "Ambassadors":
        - /url: /community/ambassadors
    - listitem:
      - link "Microsoft Privacy Statement(opens in new tab)":
        - /url: https://go.microsoft.com/fwlink/?LinkId=521839
        - text: Microsoft Privacy Statement
        - img "(opens in new tab)"
  - text: Copyright © 2026 Microsoft
```

# Test source

```ts
  1  | import { expect, Locator, Page, test } from '@playwright/test';
  2  | import { ComponentProps, LocatorProps } from '../types/page-factory/component';
  3  | import { capitalizeFirstLetter } from '../utils/generic';
  4  | import { locatorTemplateFormat } from '../utils/page-factory';
  5  | 
  6  | export abstract class Component {
  7  |   page: Page;
  8  |   locator: string;
  9  |   private name: string | undefined;
  10 | 
  11 |   constructor({ page, locator, name }: ComponentProps) {
  12 |     this.page = page;
  13 |     this.locator = locator;
  14 |     this.name = name;
  15 |   }
  16 | 
  17 |   getLocator(props: LocatorProps = {}): Locator {
  18 |     const { locator, ...context } = props;
  19 |     const withTemplate = locatorTemplateFormat(locator || this.locator, context);
  20 | 
  21 |     return this.page.locator(withTemplate);
  22 |   }
  23 | 
  24 |   get typeOf(): string {
  25 |     return 'component';
  26 |   }
  27 | 
  28 |   get typeOfUpper(): string {
  29 |     return capitalizeFirstLetter(this.typeOf);
  30 |   }
  31 | 
  32 |   get componentName(): string {
  33 |     if (!this.name) {
  34 |       throw Error('Provide "name" property to use "componentName"');
  35 |     }
  36 | 
  37 |     return this.name;
  38 |   }
  39 | 
  40 |   private getErrorMessage(action: string): string {
  41 |     return `The ${this.typeOf} with name "${this.componentName}" and locator ${this.locator} ${action}`;
  42 |   }
  43 | 
  44 |   async shouldBeVisible(locatorProps: LocatorProps = {}): Promise<void> {
  45 |     await test.step(`${this.typeOfUpper} "${this.componentName}" should be visible on the page`, async () => {
  46 |       const locator = this.getLocator(locatorProps);
> 47 |       await expect(locator, { message: this.getErrorMessage('is not visible') }).toBeVisible();
     |                                                                                  ^ Error: The title with name "Empty results" and locator p.DocSearch-Help is not visible
  48 |     });
  49 |   }
  50 | 
  51 |   async shouldHaveText(text: string, locatorProps: LocatorProps = {}): Promise<void> {
  52 |     await test.step(`${this.typeOfUpper} "${this.componentName}" should have text "${text}"`, async () => {
  53 |       const locator = this.getLocator(locatorProps);
  54 |       await expect(locator, { message: this.getErrorMessage(`does not have text "${text}"`) }).toContainText(text);
  55 |     });
  56 |   }
  57 | 
  58 |   async click(locatorProps: LocatorProps = {}): Promise<void> {
  59 |     await test.step(`Clicking the ${this.typeOf} with name "${this.componentName}"`, async () => {
  60 |       const locator = this.getLocator(locatorProps);
  61 |       await locator.click();
  62 |     });
  63 |   }
  64 | }
  65 | 
```