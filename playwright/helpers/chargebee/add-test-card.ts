import { CHARGEBEE, ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";
import { chargebee } from "./initialise";

export const addTestCard = async (customerId: string) => {
  const TEST_CARD_VALID_ACCOUNT = "4111111111111111";
  const TEST_CARD_CVV = "100";
  const TEST_CARD_EXPIRY_MONTH = 12;
  const TEST_CARD_EXPIRY_YEAR = 2023;

  console.log("Adding test card");

  type PaymentSource = { list: { item_price: { id: string } }[] };

  await new Promise<PaymentSource>((accept, reject) => {
    chargebee.payment_source
      .create_card({
        customer_id: customerId,
        card: {
          number: TEST_CARD_VALID_ACCOUNT,
          cvv: TEST_CARD_CVV,
          expiry_year: TEST_CARD_EXPIRY_YEAR,
          expiry_month: TEST_CARD_EXPIRY_MONTH,
        },
      })
      .request((error: unknown, result: PaymentSource) => {
        if (error) {
          reject(error);
        } else {
          accept(result);
        }
      });
  });
};
