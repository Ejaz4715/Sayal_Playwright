import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Audience` and its builder at `/Audience/Create`.
 *
 * The create route is `/Create`, not `/Add` — `/Add` is parsed as a record id
 * and the API answers 400, which renders an indefinite "analysing data" state
 * rather than a not-found page.
 *
 * The audience list is empty in pre-production (`total: 0`), so the empty state
 * is the observable behaviour before creating an audience.
 */
export class AudiencePage extends BasePage {
  protected path = ROUTES.audience;
  readonly shell: AppShell;

  /** Filters the builder offers, all observed on the Sakani platform tab. */
  static readonly BUILDER_FILTERS = [
    'المدينة',
    'الجنس',
    'الضمان الإجتماعي',
    'الدخل',
    'حالة العقد',
    'حالة الاستحقاق في سكني',
    'التفضيلات',
    'عدد افراد الأسرة',
    'العمر',
    'المهنة',
    'لديه تصميم هندسي',
    'لديه رخصة بناء',
    'السكن الحالي',
    'موقع العقار الجديد',
    'الحالة الاجتماعية',
    'حالة الحجز',
  ] as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  get emptyStateHeading(): Locator {
    return this.page.getByText('ليس لديك جمهور');
  }

  get emptyStateCta(): Locator {
    return this.page.getByText('إنشاء مجموعة مستهدفة جديدة');
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'اضافة جمهور' });
  }

  get nameField(): Locator {
    return this.page.locator("//input[@id='name']");
  }

  get descriptionField(): Locator {
    return this.page.locator("//input[@id='description']");
  }

  get cityField(): Locator {
    return this.page.getByRole('textbox', { name: 'المدينة' });
  }

  get genderField(): Locator {
    return this.page.getByRole('textbox', { name: 'الجنس' });
  }

  get socialSecurityField(): Locator {
    return this.page.getByRole('textbox', { name: 'الضمان الإجتماعي' });
  }

  get incomeField(): Locator {
    return this.page.getByRole('textbox', { name: 'الدخل' });
  }

  get contractStatusField(): Locator {
    return this.page.getByPlaceholder('حالة العقد');
  }

  get sakaniEligibilityField(): Locator {
    return this.page.getByPlaceholder('حالة الاستحقاق في سكني');
  }

  get preferencesField(): Locator {
    return this.page.getByRole('textbox', { name: 'التفضيلات' });
  }

  get familySizeField(): Locator {
    return this.page.getByRole('textbox', { name: 'عدد افراد الأسرة' });
  }

  get ageField(): Locator {
    return this.page.getByRole('textbox', { name: 'العمر' });
  }

  get professionField(): Locator {
    return this.page.getByRole('textbox', { name: 'المهنة' });
  }

  get engineeringDesignField(): Locator {
    return this.page.getByRole('textbox', { name: 'لديه تصميم هندسي' });
  }

  get buildingPermitField(): Locator {
    return this.page.getByRole('textbox', { name: 'لديه رخصة بناء' });
  }

  get currentResidenceField(): Locator {
    return this.page.getByRole('textbox', { name: 'السكن الحالي' });
  }

  get newPropertyLocationField(): Locator {
    return this.page.getByRole('textbox', { name: 'موقع العقار الجديد' });
  }

  get maritalStatusField(): Locator {
    return this.page.getByRole('textbox', { name: 'الحالة الاجتماعية' });
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'حفظ' });
  }

  get cityDropdown(): Locator {
    return this.page.getByPlaceholder('المدينة');
  }

  deleteAudienceIcon(name: string): Locator {
    return this.page.locator(`(//h4[normalize-space() = '${name}']/ancestor::div[contains(@class, 'Grid')])[1]/descendant::div[contains(@class, 'deleteIcon')]`);
  }

  get confirmDeleteButton(): Locator {
    return this.page.getByRole('button', { name: 'تأكيد الحذف' });
  }

  get audienceDeletedSuccessMessage(): Locator {
    return this.page.getByText('تم حذف الجمهور بنجاح');
  }

  get filtersButton(): Locator {
    return this.page.getByRole('button', { name: 'تصفية' });
  }

  platformFilterOption(platform: string): Locator {
    return this.page.getByRole('menuitem', { name: platform });
  }

  filterField(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  async selectCity(city: string): Promise<void> {
    await this.cityField.click();
    await this.page.getByText(city).first().click();
  }

  async selectGender(gender: string): Promise<void> {
    await this.genderField.click();
    await this.page.getByText(gender).click();
  }

  async selectSocialSecurity(value: string): Promise<void> {
    await this.socialSecurityField.click();
    await this.page.getByText(value).first().click();
  }

  async selectIncome(income: string): Promise<void> {
    await this.incomeField.click();
    await this.page.getByText(income).click();
  }

  async selectContractStatus(status: string): Promise<void> {
    await this.contractStatusField.click();
    await this.page.getByText(status).click();
  }

  async selectSakaniEligibility(status: string): Promise<void> {
    await this.sakaniEligibilityField.click();
    await this.page.getByText(status, { exact: true }).click();
  }

  async selectPreference(preference: string): Promise<void> {
    await this.preferencesField.click();
    await this.page.getByText(preference).click();
  }

  async selectFamilySize(size: string): Promise<void> {
    await this.familySizeField.click();
    await this.page.getByText(size).click();
  }

  async selectAge(age: string): Promise<void> {
    await this.ageField.click();
    await this.page.getByText(age).click();
  }

  async selectProfession(profession: string): Promise<void> {
    await this.professionField.click();
    await this.page.getByText(profession).click();
  }

  async selectEngineeringDesign(value: string): Promise<void> {
    await this.engineeringDesignField.click();
    await this.page.getByText(value).nth(1).click();
  }

  async selectBuildingPermit(value: string): Promise<void> {
    await this.buildingPermitField.click();
    await this.page.getByText(value).click();
  }

  async selectCurrentResidence(residence: string): Promise<void> {
    await this.currentResidenceField.click();
    await this.page.getByText(residence).nth(1).click();
  }

  async selectNewPropertyLocation(location: string): Promise<void> {
    await this.newPropertyLocationField.click();
    await this.page.getByText(location).nth(1).click();
  }

  async selectMaritalStatus(status: string): Promise<void> {
    await this.maritalStatusField.click();
    await this.page.getByText(status).click();
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.emptyStateHeading);
    await this.shell.expectReady();
  }

  async openBuilder(): Promise<void> {
    await this.gotoUntilReady(this.nameField, ROUTES.audienceCreate);
    await this.shell.expectReady();
  }

  /** Assert the builder offers a given targeting filter. */
  async expectFilterOffered(placeholder: string): Promise<void> {
    await expect(this.filterField(placeholder), `audience filter "${placeholder}"`).toBeVisible();
  }
}
