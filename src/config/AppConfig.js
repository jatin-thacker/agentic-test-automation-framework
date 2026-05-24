import appConfigJson from "./AppConfig.json" with { type: "json" };

// AppConfig is JSON-backed so non-technical users can update base URL/name
// without touching JavaScript logic.
export const AppConfig = Object.freeze({
  appName: String(appConfigJson.appName || "SauceDemo"),
  baseUrl: String(appConfigJson.baseUrl || "https://www.saucedemo.com/")
});

export default AppConfig;
