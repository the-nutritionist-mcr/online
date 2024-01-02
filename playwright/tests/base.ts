import { test as base } from "@playwright/test";

interface Fixtures {
  clock: {
    mockDate: (date: Date) => Promise<void>;
  };
}

export const test = base.extend<Fixtures>({
  clock: async ({ page }, use) => {
    use({
      mockDate: async (date: Date) => {
        await page.addInitScript(`{
          Date = class extends Date {
            constructor(...args) {
              if (args.length === 0) {
                super(${date.valueOf()});
              } else {
                super(...args);
              }
            }
          }
          const __DateNowOffset = ${date.valueOf()} - Date.now();
          const __DateNow = Date.now;
          Date.now = () => __DateNow() + __DateNowOffset;
        }`);
      },
    });
  },
});
