import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/admin.json'
});

test('test', async ({ page }) => {
  await page.goto('https://pre-sayal.housingapps.sa/main/admin/Dashboard');
  await page.getByRole('link', { name: 'الحملات' }).click();
  await page.getByRole('button', { name: 'إضافة حملة' }).click();
  await page.getByRole('textbox', { name: 'عنوان الحملة *' }).click();
  await page.getByRole('textbox', { name: 'عنوان الحملة *' }).fill('test');
  await page.getByText('اسم العميل', { exact: true }).click();
  await page.getByText('الشركة الوطنية للاسكان').first().click();
  await page.getByText('هدف الحملة').nth(1).click();
  await page.getByText('توليد عملاء محتملين').first().click();
  await page.locator('div:nth-child(2) > .dgaui_radioHead > .dgaui_radio > .dgaui_radioDot').click();
  await page.getByRole('radio', { name: 'مدفوع', exact: true }).check();
  await page.getByRole('link', { name: 'الحملات' }).click();
  await page.getByRole('textbox', { name: 'رقم الاتفاقية *' }).click();
  await page.getByRole('textbox', { name: 'رقم الاتفاقية *' }).fill('12355');
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByText('اضافة قناة').click();
  await page.getByText('نافذة منبثقة').click();
  await page.getByRole('textbox', { name: 'الوصف *' }).click();
  await page.getByRole('textbox', { name: 'الوصف *' }).fill('test');
  await page.getByRole('button', { name: 'حفظ' }).click();
  await page.getByText('تمت الإضافة بنجاح').click();
  await page.getByRole('button', { name: 'استعراض الحملة' }).click();
  await page.getByRole('button', { name: 'موافقة على الطلب' }).click();
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await page.getByText('تم الموافقة علي الحملة بنجاح').click();
  await page.getByRole('button', { name: 'تعديل الحملة' }).click();
  await page.getByRole('link', { name: 'الحملات' }).click();
  await page.getByRole('button', { name: 'إضافة حملة' }).click();
  await page.getByRole('textbox', { name: 'عنوان الحملة *' }).click();
  await page.getByRole('textbox', { name: 'عنوان الحملة *' }).fill('test');
  await page.getByText('اسم العميل', { exact: true }).click();
  await page.getByText('الشركة الوطنية للاسكان').first().click();
  await page.getByText('هدف الحملة').nth(1).click();
  await page.getByText('زيادة الوعي').first().click();
  await page.locator('div:nth-child(2) > .dgaui_radioHead > .dgaui_radio > .dgaui_radioDot').click();
  await page.getByRole('radio', { name: 'مدفوع', exact: true }).check();
  await page.getByRole('textbox', { name: 'رقم الاتفاقية *' }).click();
  await page.getByRole('textbox', { name: 'رقم الاتفاقية *' }).fill('12345');
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByText('اضافة قناة').click();
  await page.getByText('نافذة منبثقة').click();
  await page.getByRole('textbox', { name: 'الوصف *' }).click();
  await page.getByRole('textbox', { name: 'الوصف *' }).fill('test');
  await page.getByRole('button', { name: 'حفظ' }).click();
  await page.getByRole('status').filter({ hasText: 'تمت الإضافة بنجاح' }).click();
  await page.getByRole('button', { name: 'استعراض الحملة' }).click();
  await page.getByRole('button', { name: 'موافقة على الطلب' }).click();
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await page.getByText('تم الموافقة علي الحملة بنجاح').click();
});