import { Documenso } from "@documenso/sdk-typescript";
import { env } from "@/env";

export const documenso = new Documenso({
  apiKey: env.DOCUMENSO_KEY,
  serverURL: env.DOCUMENSO_URL + "/api/v2-beta",
});
