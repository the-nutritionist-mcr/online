import { chargebeeErrorType } from "./error-type";
import { getCustomer } from "./get-customer";
import { chargebee } from "./initialise";

export const deleteChargebeeCustomer = async (id: string) => {
  try {
    await new Promise((accept, reject) => {
      chargebee.customer
        .delete(id)
        .request(function (
          error: unknown,
          result: { customer: typeof chargebee.customer }
        ) {
          if (error) {
            reject(error);
          } else {
            accept(result);
          }
        });
    });

    let customer: typeof chargebee.customer | undefined;
    do {
      customer = await getCustomer(id);
      // @ts-expect-error
    } while (customer && customer?.deleted === false);

    return null;
  } catch (error) {
    const errorAs = error as { message: string };
    console.log(`Failed to delete chargebee user: ${errorAs.message}`);
  }
};
