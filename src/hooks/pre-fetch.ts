import { mutate } from "swr";
import { apiRequest } from "../core/api-request";

export const prefetch = (paths: string[]) => {
  paths.forEach((path) => mutate(path, apiRequest(path)));
};
