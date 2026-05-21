# Change Log

All notable changes to the Wazuh app project will be documented in this file.

## Wazuh dashboard v5.0.0 - OpenSearch Dashboards 3.6.0 - Revision 02

### Added

- Support for Wazuh 5.0.0
- Added notifications plugin in report definition [#2](https://github.com/wazuh/wazuh-dashboard-reporting/pull/2)
- Added missing notification channels in the UI [#48](https://github.com/wazuh/wazuh-dashboard-reporting/pull/48)
- Added HTML template for e-mail notifications [#49](https://github.com/wazuh/wazuh-dashboard-reporting/pull/49) [#156](https://github.com/wazuh/wazuh-dashboard-reporting/pull/156)
- Added conditional support for observability dashboards [#52](https://github.com/wazuh/wazuh-dashboard-reporting/pull/52)
- Export generate pdf report method [#72](https://github.com/wazuh/wazuh-dashboard-reporting/pull/72)
- Added a setting to configure the base URL for the report generated in the notification [#131](https://github.com/wazuh/wazuh-dashboard-reporting/pull/131)

### Fixed

- Fixed invalid date error in report details [#53](https://github.com/wazuh/wazuh-dashboard-reporting/pull/53)
- Fixed request error when generating report for save search on discover [#159](https://github.com/wazuh/wazuh-dashboard-reporting/pull/159)
- Fixed the validation of the notification plugin [#105](https://github.com/wazuh/wazuh-dashboard-reporting/pull/105) 
- Fixed custom filter buttons not being rendered in pdf reports [#160](https://github.com/wazuh/wazuh-dashboard-reporting/pull/160)

### Removed

- Removed OpenSearch references [#55](https://github.com/wazuh/wazuh-dashboard-reporting/pull/55)
