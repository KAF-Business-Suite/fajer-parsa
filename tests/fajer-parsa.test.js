import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Fajer Parsa Travel Agency", () => {
  it("loads the landing page, toggles language, and interacts with contact form", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: "https://kaf-business-suite.github.io/fajer-parsa/" });

    const assertResult = await testdriver.assert("The landing page for Fajer Parsa is loaded with the Persian heading and the EN button");
    expect(assertResult).toBeTruthy();

    await testdriver.find("EN button").click();

    const assertEnglishResult = await testdriver.assert("The English page is displayed with the heading \"Your trusted partner for every destination.\"");
    expect(assertEnglishResult).toBeTruthy();

    await testdriver.find("Free Consultation button").click();

    await testdriver.find("Full Name input field").click();
    await testdriver.type("Ahmad Karimi");

    await testdriver.find("WhatsApp Number input field").click();
    await testdriver.type("+93777123456");

    await testdriver.find("Your Message textarea").click();
    await testdriver.type("Inquiry about business visa services");

    await testdriver.pressKeys(["escape"]);
    await testdriver.scroll("down", { amount: 300 });

    const assertSubmitBtn = await testdriver.assert("The golden 'Send via WhatsApp' button is visible under the contact form");
    expect(assertSubmitBtn).toBeTruthy();
  });
});
