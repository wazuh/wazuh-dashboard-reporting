import { ReportsDashboardsPluginStart } from "public/types";

let plugins: ReportsDashboardsPluginStart

export const pluginsService = {
  init: (pluginStart: ReportsDashboardsPluginStart) => {
    plugins = pluginStart
  },
  hasPlugin: (pluginId: string) => {
    return plugins ? Object.keys(plugins).includes(pluginId) : false;
  }
};