import { test as base } from '@playwright/test';
import { EmployeeCrmFixture, employeeCrmFixture } from '../../fixtures/employee-crm-fixture';

export const test = base.extend<EmployeeCrmFixture>(employeeCrmFixture);
export { expect } from '@playwright/test';
