import { chargebee } from "./initialise";

export const getCustomer = async (id: string) => {
  const result = await new Promise<typeof chargebee.customer>(
    (accept, reject) => {
      chargebee.customer
        .retrieve(id)
        .request(function (
          error: unknown,
          result: { customer: typeof chargebee.customer }
        ) {
          if (error) {
            reject(error);
          } else {
            const customer: typeof chargebee.customer = result.customer;
            accept(customer);
          }
        });
    }
  );

  return result;
};
