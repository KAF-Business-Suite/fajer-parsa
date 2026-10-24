import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Fajer Parsa Travel Agency", () => {
  it("should load the homepage, switch to English, and fill the consultation form", async (context) => {
    const testdriver = TestDriver(context);

    // 1. Load the production homepage
    await testdriver.provision.chrome({ url: "https://kaf-business-suite.github.io/fajer-parsa/" });

    // 2. Verify homepage loaded with branding and navigation
    const assertResult = await testdriver.assert("the Fajer Parsa homepage is loaded and displaying navigation links");
    expect(assertResult).toBeTruthy();

    // 3. Switch language to English
    await testdriver.find("the EN language switch button in the header navigation").click();

    // 4. Verify English version is active
    const enAssertResult = await testdriver.assert("the English page is displayed with heading \"Your trusted partner for every destination\"");
    expect(enAssertResult).toBeTruthy();

    // 5. Navigate to consultation section
    await testdriver.find("the gold Free Consultation button in the header").click();

    // 6. Fill in the consultation request form
    await testdriver.find("the Full Name input field").click();
    await testdriver.type("Ahmad Parsa");

    await testdriver.find("the WhatsApp Number input field").click();
    await testdriver.type("+93777000111");

    await testdriver.find("the Your Message textarea field").click();
    await testdriver.type("Inquiry about flight tickets and visa requirements.");

    // 7. Verify the form fields are filled
    const formAssertResult = await testdriver.assert("the contact form has the full name and message filled in");
    expect(formAssertResult).toBeTruthy();
  });
});
