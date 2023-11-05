import {
  BatchWriteCommandInput,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { batchWrite, scan } from '@tnmo/dynamo';
import { batchArray } from '@tnmo/utils';

export const deleteAll = async (
  client: DynamoDBDocumentClient,
  table: string
) => {
  const data = await scan(client, table);

  const keys = data.map((item) => item.id);

  console.log(`Deleting ${keys.length} items`);

  const batches = batchArray(keys, 25);

  await Promise.all(
    batches.map(async (batch) => {
      if (batch.length > 0) {
        const input: BatchWriteCommandInput = {
          RequestItems: {
            [table]: batch.map((item) => ({
              DeleteRequest: {
                Key: {
                  id: item,
                },
              },
            })),
          },
        };

        await batchWrite(client, input);
      }
    })
  );
};
