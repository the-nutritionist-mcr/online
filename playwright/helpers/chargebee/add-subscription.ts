import { CHARGEBEE, ENV } from "@tnmo/constants";
import { ChargeBee } from "chargebee-typescript";
import { ItemPrice } from "chargebee-typescript/lib/resources";
import { v4 } from "uuid";
import { chargebee } from "./initialise";

export const addSubscription = async (customerId: string, planId: string) => {
  const itemPriceId = v4();

  console.log(`Creating item price id ${itemPriceId}`);

  type ItemPrices = { list: { item_price: { id: string } }[] };

  const result = await new Promise<ItemPrices>((accept, reject) => {
    chargebee.item_price
      .list({
        item_id: { is: planId },
      })
      .request((error: unknown, result: ItemPrices) => {
        if (error) {
          reject(error);
        } else {
          accept(result);
        }
      });
  });

  const entry = result.list[0];
  const itemPrice = entry.item_price;

  console.log(`Creating subscription`);

  await new Promise((accept, reject) => {
    chargebee.subscription
      .create_with_items(customerId, {
        subscription_items: [
          {
            item_price_id: itemPrice.id,
            quantity: 1,
          },
        ],
      })
      .request((error: unknown, result: unknown) => {
        if (error) {
          reject(error);
        } else {
          accept(result);
        }
      });
  });
  console.log(`Subscription created`);
};
