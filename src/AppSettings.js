const isLocal = false;
import environment from "./environment";

const isProd = environment === "Prod" ? true : false;

const api = isLocal
  ? "https://localhost:44340"
  : isProd
    ? "https://my.caseparts.com/core/api"
    : "https://mydev.caseparts.com/core/api";

const AppSettings = {
  CatBaker: {
    GetVersion: (userId, version) =>
      `${api}/catbaker/tree/${userId}/v/${version}`,
    PostTree: () => `${api}/catbaker/tree`,
  },
};

export default AppSettings;
