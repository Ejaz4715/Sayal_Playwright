import { type Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';

export class WebApp {
  page: Page;
  loginPage: InstanceType<typeof LoginPage>;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }
}
