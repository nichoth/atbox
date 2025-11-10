import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import { State } from '../state.js'
import './tos.css'

export const TosRoute:FunctionComponent<{
    state:ReturnType<typeof State>;
    params?:Record<string, string>;
}> = function TosRoute () {
    return html`<div class="route tos">
        <h1>The Terms of Service</h1>

        <section>
        <p><strong>Last Updated:</strong> November 8, 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
            By accessing or using this DID document management service
            (the "Service"), you agree to be bound by these Terms of Service
            ("Terms"). If you do not agree to these Terms, do not use
            the Service.
        </p>

        <h2>2. User Responsibilities</h2>

        <h3>2.1 Account Security</h3>
        <ul>
            <li>You are responsible for maintaining the security of your Bluesky account credentials</li>
            <li>You must not share your authentication tokens or credentials with others</li>
            <li>You agree to notify us immediately of any unauthorized access to your account</li>
        </ul>

        <h3>2.2 Acceptable Use</h3>
        <p>You agree NOT to use the Service to:</p>
        <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>Make unauthorized modifications to DID documents you do not own</li>
            <li>Attempt to gain unauthorized access to other users' accounts or data</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use the Service for any malicious, fraudulent, or illegal purposes</li>
        </ul>

        <h2>4. Privacy and Data Handling</h2>

        <h3>4.1 Data We Access</h3>
        <p>When you use the Service, we may access:</p>
        <ul>
            <li>Your Bluesky account information necessary for authentication</li>
            <li>Your DID document data</li>
            <li>Technical information such as IP addresses and browser data</li>
        </ul>

        <h3>4.2 Data Storage</h3>
        <ul>
            <li>We do not permanently store your Bluesky credentials</li>
            <li>Authentication tokens are handled securely and may be temporarily cached</li>
            <li>We do not sell or share your personal information with third parties</li>
            <li>You can request deletion of any stored data by contacting us</li>
        </ul>

        <h3>4.3 Cookies and Tracking</h3>
        <p>
            The Service may use cookies and similar technologies for
            authentication and functionality purposes.
        </p>

        <h2>5. Modifications to DID Documents</h2>

        <h3>5.1 Your Control</h3>
        <ul>
            <li>You retain full control over your DID document</li>
            <li>All modifications are made with your explicit consent</li>
            <li>
                You are responsible for the accuracy of information in your
                DID document
            </li>
        </ul>

        <h3>5.2 No Warranty</h3>
        <ul>
            <li>
                We provide tools to modify your DID document but cannot
                guarantee that all changes will be accepted by the AT
                Protocol network
            </li>
            <li>
                You acknowledge that DID document changes may have
                consequences for your Bluesky account functionality
            </li>
        </ul>

        <h2>6. Disclaimer of Warranties</h2>
        <p>
            <strong>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                BUT NOT LIMITED TO:
            </strong>
        </p>
        <ul>
            <li>Merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
            <li>Availability or uptime</li>
            <li>Data accuracy or completeness</li>
        </ul>
        <p><strong>We do not guarantee that:</strong></p>
        <ul>
            <li>The Service will be uninterrupted, secure, or error-free</li>
            <li>Any errors or defects will be corrected</li>
            <li>The Service will meet your specific requirements</li>
        </ul>

        <h2>7. Limitation of Liability</h2>
        <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
        <ul>
            <li>
                We shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages
            </li>
            <li>
                We shall not be liable for any loss of data, revenue, profits,
                or business opportunities
            </li>
            <li>
                Our total liability shall not exceed $100 USD or the amount you
                paid to use the Service (if any), whichever is greater
            </li>
        </ul>
        <p>
            You acknowledge that modifications to your DID document could
            potentially affect your Bluesky account, and you use the Service
            at your own risk.
        </p>

        <h2>8. Indemnification</h2>
        <p>
            You agree to indemnify and hold harmless the Service, its
            operators, and affiliates from any claims, damages, losses,
            liabilities, and expenses (including legal fees) arising from:
        </p>
        <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of others</li>
            <li>Modifications you make to your DID document</li>
        </ul>

        <h2>9. Third-Party Services</h2>
        <p>The Service interacts with:</p>
        <ul>
            <li>The AT Protocol network</li>
            <li>Bluesky's infrastructure</li>
            <li>Other third-party services</li>
        </ul>
        <p>
            We are not responsible for the availability, content, or policies
            of these third-party services.
        </p>

        <h2>10. Termination</h2>

        <h3>10.1 By You</h3>
        <p>You may stop using the Service at any time.</p>

        <h3>10.2 By Us</h3>
        <p>We reserve the right to:</p>
        <ul>
            <li>
                Suspend or terminate your access to the Service at any time
            </li>
            <li>Modify or discontinue the Service without notice</li>
            <li>Refuse service to anyone for any reason</li>
        </ul>

        <h2>11. Changes to Terms</h2>
        <p>
            We reserve the right to modify these Terms at any time. Changes
            will be effective immediately upon posting to this page. Your
            continued use of the Service after changes constitutes acceptance
            of the modified Terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
            These Terms shall be governed by and construed in accordance with
            the laws of [Your Jurisdiction], without regard to its conflict of
            law provisions.
        </p>

        <h2>13. Open Source</h2>
        <p>
            Portions of this Service may be open source software. Any open
            source components are licensed under their respective licenses,
            which may be found in the project's repository.
        </p>

        <h2>14. Entire Agreement</h2>
        <p>
            These Terms constitute the entire agreement between you and the
            Service regarding the use of the Service and supersede any prior
            agreements.
        </p>

        <h2>15. Contact Information</h2>
        <p>
            If you have any questions about these Terms, please contact
            us at: <strong>
                <a href="mailto:mail@atbox.dev">mail@atbox.dev</a>
            </strong>
        </p>

        <hr />

        <p>
            <em>
                By using this Service, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
            </em>
        </p>
    </section>

        <p>
            Nothing illegal please.
        </p>
    </div>`
}
