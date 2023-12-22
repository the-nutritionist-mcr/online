import { HTTP } from "@tnmo/constants";

export type HttpStatusCodes =
  (typeof HTTP)["statusCodes"][keyof (typeof HTTP)["statusCodes"]];
