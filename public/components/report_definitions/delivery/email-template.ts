const emailTemplate =
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0"
    width="100%" style="margin-top: 20px;">
    <tr>
        <td align="center">
            <!-- Main container -->
            <table role="presentation" border="0" cellpadding="0"
                cellspacing="0"
                width="100%" class="body">
                <tr>
                    <td align="center">
                        <!-- Card (2/3 width) -->
                        <table role="presentation" border="0" cellpadding="0"
                            cellspacing="0" width="66.6%" class="main-content"
                            style="max-width: 700px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">

                            <!-- Blue banner -->
                            <tr>
                                <td align="center" bgcolor="#3D82F1"
                                    style="padding: 40px 0; border-radius: 30px;">
                                    <img src="https://raw.githubusercontent.com/wazuh/wazuh-dashboard-reporting/refs/heads/main/assets/logo-white.png"
                                        alt="Wazuh logo"
                                        style="max-width: 160px; height: auto; display: block;">
                                </td>
                            </tr>

                            <!-- Report icon -->
                            <tr>
                                <td align="center"
                                    style="padding: 40px 0 20px;">
                                    <img src="https://raw.githubusercontent.com/wazuh/wazuh-dashboard-reporting/refs/heads/main/assets/email-icon.png"
                                        alt="Report Icon"
                                        style="max-width: 120px; height: auto; display: block;">
                                </td>
                            </tr>

                            <!-- Title -->
                            <tr>
                                <td align="center" style="padding: 0 40px;">
                                    <h2
                                        style="font-size: 26px; font-weight: 200; margin: 0; color: #000000; font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;">New
                                        Report <span
                                            style="font-weight: 800;">Available</span></h2>
                                </td>
                            </tr>

                            <!-- Main text -->
                            <tr>
                                <td align="center"
                                    style="padding: 20px 30px 0;">
                                    <p
                                        style="font-size: 14px; font-weight: 400; color: #000000; line-height: 2.2; margin: 0; font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                        A new report has been generated and is
                                        now available for
                                        review in your Wazuh platform.<br />
                                        You can access your report by clicking
                                        the button below
                                        or using the provided link.
                                    </p>
                                </td>
                            </tr>

                            <!-- Gradient button -->
                            <tr>
                                <td align="center"
                                    style="padding: 30px 0 40px;">
                                    <table border="0" cellpadding="0"
                                        cellspacing="0"
                                        role="presentation">
                                        <tr>
                                            <td align="center" bgcolor="#FEDD0B"
                                                style="border-radius: 8px; background: linear-gradient(90deg, #FEDD0B 0%, #F6B71B 100%);">
                                                <a href="{{reportLink}}"
                                                    target="_blank"
                                                    style="display: inline-block; padding: 14px 60px; font-size: 14px;; font-weight: 400; color: #000000; text-decoration: none; border-radius: 8px; font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                                    View Report
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 0 30px;">
                                    <hr
                                        style="border: none; border-top: 1px solid #cccccc; margin: 0;">
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center"
                                    style="padding: 0 30px 30px;">
                                    <p
                                        style="font-size: 12px; color: #8690A0; font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4;">
                                        Is the
                                        'Open in Wazuh Dashboards Reports'
                                        button not
                                        working?<br />
                                        Copy and paste this link into your
                                        browser:
                                        {{reportLink}}<br /><br />
                                        No longer want to receive this report?
                                        Please contact
                                        the report sender or the administrator
                                        of your Wazuh.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;
