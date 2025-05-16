import { expect, test, testWithoutJS } from "tests/setup/tests";

const route = "/examples/schemas/datetime";

test("With JS enabled", async ({ example }) => {
  const { button, page } = example;
  const datetime = example.field("datetime");

  await page.goto(route);

  // Render
  await example.expectField(datetime, { type: "datetime-local" });

  await expect(button).toBeEnabled();

  // Client-side validation
  await datetime.input.fill("");
  await button.click();

  // Show field errors and focus on the first field
  await example.expectError(datetime, "Expected date, received null");
  await expect(datetime.input).toBeFocused();

  // Make field be valid
  await datetime.input.fill("2022-01-01T13:00");
  await button.click();
  await example.expectValid(datetime);

  // Submit form
  await button.click();
  await example.expectValid(datetime);
  await expect(button).toBeDisabled();

  await example.expectData({
    datetime: expect.stringContaining("2022-01-01T16:00:00.000Z"),
  });
});

testWithoutJS("With JS disabled", async ({ example }) => {
  const { button, page } = example;
  const datetime = example.field("datetime");

  await page.goto(route);

  // Server-side validation
  await datetime.input.fill("");
  await button.click();
  await page.reload();

  // Show field errors and focus on the first field
  await example.expectError(datetime, "Expected date, received null");
  await example.expectAutoFocus(datetime);

  // Make field be valid
  await datetime.input.fill("2022-01-01T13:00");
  await button.click();
  await page.reload();
  await example.expectValid(datetime);

  // Submit form
  await button.click();
  await page.reload();

  await example.expectData({
    datetime: expect.stringContaining("2022-01-01T16:00:00.000Z"),
  });
});
