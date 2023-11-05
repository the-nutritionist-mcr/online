import { batchArray } from '@tnmo/utils';
import { batchWrite } from '@tnmo/dynamo';
import {
  BatchWriteCommandInput,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

export const writeData = async (
  client: DynamoDBDocumentClient,
  table: string,
  data: Record<string, unknown>[]
) => {
  const batches = batchArray(data, 25);

  await Promise.all(
    batches.map(async (batch) => {
      if (batch.length > 0) {
        const input: BatchWriteCommandInput = {
          RequestItems: {
            [table]: batch.map((item) => ({
              PutRequest: {
                Item: item,
              },
            })),
          },
        };

        await batchWrite(client, input);
      }
    })
  );
};
