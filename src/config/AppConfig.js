import EnvironmentConfig from "./EnvironmentConfig.js";

export const AppConfig = Object.freeze({
  appName: EnvironmentConfig.get("APP_NAME", "SauceDemo"),
  baseUrl: EnvironmentConfig.get("BASE_URL", "https://www.saucedemo.com/")
});

export default AppConfig;
