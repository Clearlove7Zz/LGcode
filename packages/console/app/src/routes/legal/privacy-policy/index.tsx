import "..@lgcode/..@lgcode/brand@lgcode/index.css"
import ".@lgcode/index.css"
import { Title, Meta } from "@solidjs@lgcode/meta"
import { Header } from "~@lgcode/component@lgcode/header"
import { Footer } from "~@lgcode/component@lgcode/footer"
import { Legal } from "~@lgcode/component@lgcode/legal"
import { LocaleLinks } from "~@lgcode/component@lgcode/locale-links"
import { useLanguage } from "~@lgcode/context@lgcode/language"

export default function PrivacyPolicy() {
  const language = useLanguage()
  return (
    <main data-page="legal">
      <Title>OpenCode | Privacy Policy<@lgcode/Title>
      <LocaleLinks path="@lgcode/legal@lgcode/privacy-policy" @lgcode/>
      <Meta name="description" content="OpenCode privacy policy" @lgcode/>
      <div data-component="container">
        <Header @lgcode/>

        <div data-component="content">
          <section data-component="brand-content">
            <article data-component="privacy-policy">
              <h1>Privacy Policy<@lgcode/h1>
              <p class="effective-date">Effective date: Mar 6, 2026<@lgcode/p>

              <p>
                At OpenCode, we take your privacy seriously. Please read this Privacy Policy to learn how we treat your
                personal data.{" "}
                <strong>
                  By using or accessing our Services in any manner, you acknowledge that you accept the practices and
                  policies outlined below, and you hereby consent that we will collect, use and disclose your
                  information as described in this Privacy Policy.
                <@lgcode/strong>{" "}
                For clarity, our open source software that is not provided to you on a hosted basis is subject to the
                open source license and terms set forth on the applicable repository where you access such open source
                software, and such license and terms will exclusively govern your use of such open source software.
              <@lgcode/p>

              <p>
                Remember that your use of OpenCode is at all times subject to our Terms of Use,{" "}
                <a href={language.route("@lgcode/legal@lgcode/terms-of-service")}>https:@lgcode/@lgcode/opencode.ai@lgcode/legal@lgcode/terms-of-service<@lgcode/a>,
                which incorporates this Privacy Policy. Any terms we use in this Policy without defining them have the
                definitions given to them in the Terms of Use.
              <@lgcode/p>

              <p>You may print a copy of this Privacy Policy by clicking the print button in your browser.<@lgcode/p>

              <p>
                As we continually work to improve our Services, we may need to change this Privacy Policy from time to
                time. We will alert you of material changes by placing a notice on the OpenCode website, by sending you
                an email and@lgcode/or by some other means. Please note that if you've opted not to receive legal notice emails
                from us (or you haven't provided us with your email address), those legal notices will still govern your
                use of the Services, and you are still responsible for reading and understanding them. If you use the
                Services after any changes to the Privacy Policy have been posted, that means you agree to all of the
                changes.
              <@lgcode/p>

              <h2>Privacy Policy Table of Contents<@lgcode/h2>
              <ul>
                <li>
                  <a href="#what-this-privacy-policy-covers">What this Privacy Policy Covers<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#personal-data">Personal Data<@lgcode/a>
                  <ul>
                    <li>
                      <a href="#categories-of-personal-data">Categories of Personal Data We Collect<@lgcode/a>
                    <@lgcode/li>
                    <li>
                      <a href="#commercial-purposes">
                        Our Commercial or Business Purposes for Collecting Personal Data
                      <@lgcode/a>
                    <@lgcode/li>
                    <li>
                      <a href="#other-permitted-purposes">Other Permitted Purposes for Processing Personal Data<@lgcode/a>
                    <@lgcode/li>
                    <li>
                      <a href="#categories-of-sources">Categories of Sources of Personal Data<@lgcode/a>
                    <@lgcode/li>
                  <@lgcode/ul>
                <@lgcode/li>
                <li>
                  <a href="#how-we-disclose">How We Disclose Your Personal Data<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#tracking-tools">Tracking Tools and Opt-Out<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#data-security">Data Security<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#personal-data-of-children">Personal Data of Children<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#california-resident-rights">California Resident Rights ("CCPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#colorado-resident-rights">Colorado Resident Rights ("CPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#connecticut-resident-rights">Connecticut Resident Rights ("CTDPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#delaware-resident-rights">Delaware Resident Rights ("DPDPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#iowa-resident-rights">Iowa Resident Rights ("ICDPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#montana-resident-rights">Montana Resident Rights ("MCDPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#nebraska-resident-rights">Nebraska Resident Rights ("NDPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#new-hampshire-resident-rights">New Hampshire Resident Rights ("NHPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#new-jersey-resident-rights">New Jersey Resident Rights ("NJPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#oregon-resident-rights">Oregon Resident Rights ("OCPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#texas-resident-rights">Texas Resident Rights ("TDPSA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#utah-resident-rights">Utah Resident Rights ("UCPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#virginia-resident-rights">Virginia Resident Rights ("VCDPA")<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#exercising-your-rights">Exercising Your Rights under the State Privacy Laws<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#other-state-law-privacy-rights">Other State Law Privacy Rights<@lgcode/a>
                <@lgcode/li>
                <li>
                  <a href="#contact-information">Contact Information<@lgcode/a>
                <@lgcode/li>
              <@lgcode/ul>

              <h2 id="what-this-privacy-policy-covers">What this Privacy Policy Covers<@lgcode/h2>
              <p>
                This Privacy Policy covers how we treat Personal Data that we gather when you access or use our
                Services. "Personal Data" means any information that identifies or relates to a particular individual
                and also includes information referred to as "personally identifiable information" or "personal
                information" under applicable data privacy laws, rules or regulations. This Privacy Policy does not
                cover the practices of companies we don't own or control or people we don't manage.
              <@lgcode/p>

              <h2 id="personal-data">Personal Data<@lgcode/h2>

              <h3 id="categories-of-personal-data">Categories of Personal Data We Collect<@lgcode/h3>
              <p>
                This chart details the categories of Personal Data that we collect and have collected over the past 12
                months:
              <@lgcode/p>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Category of Personal Data (and Examples)<@lgcode/th>
                      <th>Business or Commercial Purpose(s) for Collection<@lgcode/th>
                      <th>Categories of Third Parties With Whom We Disclose this Personal Data<@lgcode/th>
                    <@lgcode/tr>
                  <@lgcode/thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Profile or Contact Data<@lgcode/strong> such as first and last name, email, phone number and
                        mailing address.
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Providing, Customizing and Improving the Services<@lgcode/li>
                          <li>Marketing the Services<@lgcode/li>
                          <li>Corresponding with You<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Service Providers<@lgcode/li>
                          <li>Business Partners<@lgcode/li>
                          <li>Parties You Authorize, Access or Authenticate<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                    <@lgcode/tr>
                    <tr>
                      <td>
                        <strong>Payment Data<@lgcode/strong> such as financial account information, payment card type, full
                        number of payment card, last 4 digits of payment card, bank account information, billing
                        address, billing phone number and billing email
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Providing, Customizing and Improving the Services<@lgcode/li>
                          <li>Marketing the Services<@lgcode/li>
                          <li>Corresponding with You<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Service Providers (specifically our payment processing partner)<@lgcode/li>
                          <li>Business Partners<@lgcode/li>
                          <li>Parties You Authorize, Access or Authenticate<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                    <@lgcode/tr>
                    <tr>
                      <td>
                        <strong>Device@lgcode/IP Data<@lgcode/strong> such as IP address, device ID, domain server, type of
                        device@lgcode/operating system@lgcode/browser used to access the Services.
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Providing, Customizing and Improving the Services<@lgcode/li>
                          <li>Marketing the Services<@lgcode/li>
                          <li>Corresponding with You<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>None<@lgcode/li>
                          <li>Service Providers<@lgcode/li>
                          <li>Business Partners<@lgcode/li>
                          <li>Parties You Authorize, Access or Authenticate<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                    <@lgcode/tr>
                    <tr>
                      <td>
                        <strong>Other Identifying Information that You Voluntarily Choose to Provide<@lgcode/strong> such as
                        information included in conversations or prompts that you submit to AI
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Providing, Customizing and Improving the Services<@lgcode/li>
                          <li>Marketing the Services<@lgcode/li>
                          <li>Corresponding with You<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                      <td>
                        <ul>
                          <li>Service Providers<@lgcode/li>
                          <li>Business Partners<@lgcode/li>
                          <li>Parties You Authorize, Access or Authenticate<@lgcode/li>
                        <@lgcode/ul>
                      <@lgcode/td>
                    <@lgcode/tr>
                  <@lgcode/tbody>
                <@lgcode/table>
              <@lgcode/div>

              <h3 id="commercial-purposes">Our Commercial or Business Purposes for Collecting Personal Data<@lgcode/h3>

              <h4>Providing, Customizing and Improving the Services<@lgcode/h4>
              <ul>
                <li>Creating and managing your account or other user profiles.<@lgcode/li>
                <li>Providing you with the products, services or information you request.<@lgcode/li>
                <li>Meeting or fulfilling the reason you provided the information to us.<@lgcode/li>
                <li>Providing support and assistance for the Services.<@lgcode/li>
                <li>
                  Improving the Services, including testing, research, internal analytics and product development.
                <@lgcode/li>
                <li>Doing fraud protection, security and debugging.<@lgcode/li>
                <li>
                  Carrying out other business purposes stated when collecting your Personal Data or as otherwise set
                  forth in applicable data privacy laws, such as the California Consumer Privacy Act, as amended by the
                  California Privacy Rights Act of 2020 (the "CCPA"), the Colorado Privacy Act (the "CPA"), the
                  Connecticut Data Privacy Act (the "CTDPA"), the Delaware Personal Data Privacy Act (the "DPDPA"), the
                  Iowa Consumer Data Protection Act (the "ICDPA"), the Montana Consumer Data Privacy Act ("MCDPA"), the
                  Nebraska Data Privacy Act (the "NDPA"), the New Hampshire Privacy Act (the "NHPA"), the New Jersey
                  Privacy Act (the "NJPA"), the Oregon Consumer Privacy Act ("OCPA"), the Texas Data Privacy and
                  Security Act ("TDPSA"), the Utah Consumer Privacy Act (the "UCPA"), or the Virginia Consumer Data
                  Protection Act (the "VCDPA") (collectively, the "State Privacy Laws").
                <@lgcode/li>
              <@lgcode/ul>

              <h4>Marketing the Services<@lgcode/h4>
              <ul>
                <li>Marketing and selling the Services.<@lgcode/li>
              <@lgcode/ul>

              <h4>Corresponding with You<@lgcode/h4>
              <ul>
                <li>
                  Responding to correspondence that we receive from you, contacting you when necessary or requested, and
                  sending you information about OpenCode.
                <@lgcode/li>
                <li>Sending emails and other communications according to your preferences.<@lgcode/li>
              <@lgcode/ul>

              <h3 id="other-permitted-purposes">Other Permitted Purposes for Processing Personal Data<@lgcode/h3>
              <p>
                In addition, each of the above referenced categories of Personal Data may be collected, used, and
                disclosed with the government, including law enforcement, or other parties to meet certain legal
                requirements and enforcing legal terms including: fulfilling our legal obligations under applicable law,
                regulation, court order or other legal process, such as preventing, detecting and investigating security
                incidents and potentially illegal or prohibited activities; protecting the rights, property or safety of
                you, OpenCode or another party; enforcing any agreements with you; responding to claims that any posting
                or other content violates third-party rights; and resolving disputes.
              <@lgcode/p>

              <p>
                We will not collect additional categories of Personal Data or use the Personal Data we collected for
                materially different, unrelated or incompatible purposes without providing you notice or obtaining your
                consent.
              <@lgcode/p>

              <h3 id="categories-of-sources">Categories of Sources of Personal Data<@lgcode/h3>
              <p>We collect Personal Data about you from the following categories of sources:<@lgcode/p>

              <h4>You<@lgcode/h4>
              <ul>
                <li>
                  When you provide such information directly to us.
                  <ul>
                    <li>When you create an account or use our interactive tools and Services.<@lgcode/li>
                    <li>
                      When you voluntarily provide information in free-form text boxes through the Services or through
                      responses to surveys or questionnaires.
                    <@lgcode/li>
                    <li>When you send us an email or otherwise contact us.<@lgcode/li>
                  <@lgcode/ul>
                <@lgcode/li>
                <li>
                  When you use the Services and such information is collected automatically.
                  <ul>
                    <li>Through Cookies (defined in the "Tracking Tools and Opt-Out" section below).<@lgcode/li>
                    <li>
                      If you download and install certain applications and software we make available, we may receive
                      and collect information transmitted from your computing device for the purpose of providing you
                      the relevant Services, such as information regarding when you are logged on and available to
                      receive updates or alert notices.
                    <@lgcode/li>
                  <@lgcode/ul>
                <@lgcode/li>
              <@lgcode/ul>

              <h4>Public Records<@lgcode/h4>
              <ul>
                <li>From the government.<@lgcode/li>
              <@lgcode/ul>

              <h4>Third Parties<@lgcode/h4>
              <ul>
                <li>
                  Vendors
                  <ul>
                    <li>
                      We may use analytics providers to analyze how you interact and engage with the Services, or third
                      parties may help us provide you with customer support.
                    <@lgcode/li>
                    <li>We may use vendors to obtain information to generate leads and create user profiles.<@lgcode/li>
                  <@lgcode/ul>
                <@lgcode/li>
              <@lgcode/ul>

              <h2 id="how-we-disclose">How We Disclose Your Personal Data<@lgcode/h2>
              <p>
                We disclose your Personal Data to the categories of service providers and other parties listed in this
                section. Depending on state laws that may be applicable to you, some of these disclosures may constitute
                a "sale" of your Personal Data. For more information, please refer to the state-specific sections below.
              <@lgcode/p>

              <h3>Service Providers<@lgcode/h3>
              <p>
                These parties help us provide the Services or perform business functions on our behalf. They include:
              <@lgcode/p>
              <ul>
                <li>Hosting, technology and communication providers.<@lgcode/li>
                <li>Analytics providers for web traffic or usage of the site.<@lgcode/li>
                <li>Security and fraud prevention consultants.<@lgcode/li>
                <li>Support and customer service vendors.<@lgcode/li>
              <@lgcode/ul>

              <h3>Business Partners<@lgcode/h3>
              <p>These parties partner with us in offering various services. They include:<@lgcode/p>
              <ul>
                <li>Businesses that you have a relationship with.<@lgcode/li>
                <li>Companies that we partner with to offer joint promotional offers or opportunities.<@lgcode/li>
              <@lgcode/ul>

              <h3>Parties You Authorize, Access or Authenticate<@lgcode/h3>
              <p>Parties You Authorize, Access or Authenticate.<@lgcode/p>

              <h3>Legal Obligations<@lgcode/h3>
              <p>
                We may disclose any Personal Data that we collect with third parties in conjunction with any of the
                activities set forth under "Other Permitted Purposes for Processing Personal Data" section above.
              <@lgcode/p>

              <h3>Business Transfers<@lgcode/h3>
              <p>
                All of your Personal Data that we collect may be transferred to a third party if we undergo a merger,
                acquisition, bankruptcy or other transaction in which that third party assumes control of our business
                (in whole or in part).
              <@lgcode/p>

              <h3>Data that is Not Personal Data<@lgcode/h3>
              <p>
                We may create aggregated, de-identified or anonymized data from the Personal Data we collect, including
                by removing information that makes the data personally identifiable to a particular user. We may use
                such aggregated, de-identified or anonymized data and disclose it with third parties for our lawful
                business purposes, including to analyze, build and improve the Services and promote our business,
                provided that we will not disclose such data in a manner that could identify you.
              <@lgcode/p>

              <h2 id="tracking-tools">Tracking Tools and Opt-Out<@lgcode/h2>
              <p>
                The Services use cookies and similar technologies such as pixel tags, web beacons, clear GIFs and
                JavaScript (collectively, "Cookies") to enable our servers to recognize your web browser, tell us how
                and when you visit and use our Services, analyze trends, learn about our user base and operate and
                improve our Services. Cookies are small pieces of data– usually text files – placed on your computer,
                tablet, phone or similar device when you use that device to access our Services. We may also supplement
                the information we collect from you with information received from third parties, including third
                parties that have placed their own Cookies on your device(s).
              <@lgcode/p>

              <p>
                Please note that because of our use of Cookies, the Services do not support "Do Not Track" requests sent
                from a browser at this time.
              <@lgcode/p>

              <p>We use the following types of Cookies:<@lgcode/p>

              <ul>
                <li>
                  <strong>Essential Cookies.<@lgcode/strong> Essential Cookies are required for providing you with features or
                  services that you have requested. For example, certain Cookies enable you to log into secure areas of
                  our Services. Disabling these Cookies may make certain features and services unavailable.
                <@lgcode/li>
                <li>
                  <strong>Functional Cookies.<@lgcode/strong> Functional Cookies are used to record your choices and settings
                  regarding our Services, maintain your preferences over time and recognize you when you return to our
                  Services. These Cookies help us to personalize our content for you, greet you by name and remember
                  your preferences (for example, your choice of language or region).
                <@lgcode/li>
                <li>
                  <strong>Performance@lgcode/Analytical Cookies.<@lgcode/strong> Performance@lgcode/Analytical Cookies allow us to understand
                  how visitors use our Services. They do this by collecting information about the number of visitors to
                  the Services, what pages visitors view on our Services and how long visitors are viewing pages on the
                  Services. Performance@lgcode/Analytical Cookies also help us measure the performance of our advertising
                  campaigns in order to help us improve our campaigns and the Services' content for those who engage
                  with our advertising. For example, Google LLC ("Google") uses cookies in connection with its Google
                  Analytics services. Google's ability to use and disclose information collected by Google Analytics
                  about your visits to the Services is subject to the Google Analytics Terms of Use and the Google
                  Privacy Policy. You have the option to opt-out of Google's use of Cookies by visiting the Google
                  advertising opt-out page at{" "}
                  <a href="http:@lgcode/@lgcode/www.google.com@lgcode/privacy_ads.html">www.google.com@lgcode/privacy_ads.html<@lgcode/a> or the Google
                  Analytics Opt-out Browser Add-on at{" "}
                  <a href="https:@lgcode/@lgcode/tools.google.com@lgcode/dlpage@lgcode/gaoptout@lgcode/">https:@lgcode/@lgcode/tools.google.com@lgcode/dlpage@lgcode/gaoptout@lgcode/<@lgcode/a>.
                <@lgcode/li>
              <@lgcode/ul>

              <p>
                You can decide whether or not to accept Cookies through your internet browser's settings. Most browsers
                have an option for turning off the Cookie feature, which will prevent your browser from accepting new
                Cookies, as well as (depending on the sophistication of your browser software) allow you to decide on
                acceptance of each new Cookie in a variety of ways. You can also delete all Cookies that are already on
                your device. If you do this, however, you may have to manually adjust some preferences every time you
                visit our website and some of the Services and functionalities may not work.
              <@lgcode/p>

              <p>
                To find out more information about Cookies generally, including information about how to manage and
                delete Cookies, please visit{" "}
                <a href="http:@lgcode/@lgcode/www.allaboutcookies.org@lgcode/">http:@lgcode/@lgcode/www.allaboutcookies.org@lgcode/<@lgcode/a>.
              <@lgcode/p>

              <h2 id="data-security">Data Security<@lgcode/h2>
              <p>
                We seek to protect your Personal Data from unauthorized access, use and disclosure using appropriate
                physical, technical, organizational and administrative security measures based on the type of Personal
                Data and how we are processing that data. You should also help protect your data by appropriately
                selecting and protecting your password and@lgcode/or other sign-on mechanism; limiting access to your computer
                or device and browser; and signing off after you have finished accessing your account. Although we work
                to protect the security of your account and other data that we hold in our records, please be aware that
                no method of transmitting data over the internet or storing data is completely secure.
              <@lgcode/p>

              <h3>Data Retention<@lgcode/h3>
              <p>
                We retain Personal Data about you for as long as necessary to provide you with our Services or to
                perform our business or commercial purposes for collecting your Personal Data. When establishing a
                retention period for specific categories of data, we consider who we collected the data from, our need
                for the Personal Data, why we collected the Personal Data, and the sensitivity of the Personal Data. In
                some cases we retain Personal Data for longer, if doing so is necessary to comply with our legal
                obligations, resolve disputes or collect fees owed, or is otherwise permitted or required by applicable
                law, rule or regulation. We may further retain information in an anonymous or aggregated form where that
                information would not identify you personally.
              <@lgcode/p>

              <h2 id="personal-data-of-children">Personal Data of Children<@lgcode/h2>
              <p>
                As noted in the Terms of Use, we do not knowingly collect or solicit Personal Data from children under
                18 years of age; if you are a child under the age of 18, please do not attempt to register for or
                otherwise use the Services or send us any Personal Data. If we learn we have collected Personal Data
                from a child under 18 years of age, we will delete that information as quickly as possible. If you
                believe that a child under 18 years of age may have provided Personal Data to us, please contact us at{" "}
                <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h2 id="california-resident-rights">California Resident Rights<@lgcode/h2>
              <p>
                If you are a California resident, you have the rights set forth in this section. Please see the
                "Exercising Your Rights under the State Privacy Laws" section below for instructions regarding how to
                exercise these rights. Please note that we may process Personal Data of our customers' end users or
                employees in connection with our provision of certain services to our customers. If we are processing
                your Personal Data as a service provider, you should contact the entity that collected your Personal
                Data in the first instance to address your rights with respect to such data. Additionally, please note
                that these rights are subject to certain conditions and exceptions under applicable law, which may
                permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a California resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access<@lgcode/h3>
              <p>
                You have the right to request certain information about our collection and use of your Personal Data. In
                response, we will provide you with the following information in the past 12 months:
              <@lgcode/p>
              <ul>
                <li>The categories of Personal Data that we have collected about you.<@lgcode/li>
                <li>The categories of sources from which that Personal Data was collected.<@lgcode/li>
                <li>The business or commercial purpose for collecting or selling your Personal Data.<@lgcode/li>
                <li>The categories of third parties with whom we have shared your Personal Data.<@lgcode/li>
                <li>The specific pieces of Personal Data that we have collected about you.<@lgcode/li>
              <@lgcode/ul>

              <p>
                If we have disclosed your Personal Data to any third parties for a business purpose over the past 12
                months, we will identify the categories of Personal Data shared with each category of third party
                recipient. If we have sold your Personal Data over the past 12 months, we will identify the categories
                of Personal Data sold to each category of third party recipient.
              <@lgcode/p>

              <p>
                You may request the above information beyond the 12-month period, but no earlier than January 1, 2022.
                If you do make such a request, we are required to provide that information unless doing so proves
                impossible or would involve disproportionate effort.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>
                You have the right to request that we delete the Personal Data that we have collected from you. Under
                the CCPA, this right is subject to certain exceptions: for example, we may need to retain your Personal
                Data to provide you with the Services or complete a transaction or other action you have requested, or
                if deletion of your Personal Data involves disproportionate effort. If your deletion request is subject
                to one of these exceptions, we may deny your deletion request.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to request that we correct any inaccurate Personal Data we have collected about you.
                Under the CCPA, this right is subject to certain exceptions: for example, if we decide, based on the
                totality of circumstances related to your Personal Data, that such data is correct. If your correction
                request is subject to one of these exceptions, we may deny your request.
              <@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We will not sell or share your Personal Data, and have not done so over the last 12 months. To our
                knowledge, we do not sell or share the Personal Data of minors under 13 years of age or of consumers
                under 16 years of age.
              <@lgcode/p>

              <h3>Limit the Use of Sensitive Personal Information<@lgcode/h3>
              <p>
                Consumers have certain rights over the processing of their Sensitive Personal Information. However, we
                do not collect Sensitive Personal Information.
              <@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the CCPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the CCPA. We will not deny you our
                goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the CCPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the CCPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="colorado-resident-rights">Colorado Resident Rights<@lgcode/h2>
              <p>
                If you are a Colorado resident, you have the rights set forth under the Colorado Privacy Act ("CPA").
                Please see the "Exercising Your Rights under the State Privacy Laws" section below for instructions
                regarding how to exercise these rights. Please note that we may process Personal Data of our customers'
                end users or employees in connection with our provision of certain services to our customers. If we are
                processing your Personal Data as a service provider, you should contact the entity that collected your
                Personal Data in the first instance to address your rights with respect to such data. Additionally,
                please note that these rights are subject to certain conditions and exceptions under applicable law,
                which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Colorado resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access and request a copy of your Personal Data in a machine-readable format, to the extent technically
                feasible, twice within a calendar year.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data concerning you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the CPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the CPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic situation, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                CPA that concern you.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, 2)
                Personal Data from a known child under 13 years of age, 3) to sell, or process Personal Data for
                Targeted Advertising or Profiling after you exercise your right to opt-out, or 4) Personal Data for
                Secondary Use.
              <@lgcode/p>

              <p>
                If you would like to withdraw your consent, please follow the instructions under the "Exercising Your
                Rights under the State Privacy Laws" section.
              <@lgcode/p>

              <h3>We Will Not Discriminate Against You<@lgcode/h3>
              <p>
                We will not process your personal data in violation of state and federal laws that prohibit unlawful
                discrimination against consumers.
              <@lgcode/p>

              <h2 id="connecticut-resident-rights">Connecticut Resident Rights<@lgcode/h2>
              <p>
                If you are a Connecticut resident, you have the rights set forth under the Connecticut Data Privacy Act
                ("CTDPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Connecticut resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the CTDPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" as defined under the CTDPA. "Profiling" means any
                form of automated processing performed on personal data to evaluate, analyze or predict personal aspects
                related to an identified or identifiable individual's economic situation, health, personal preferences,
                interests, reliability, behavior, location or movements.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, 2)
                Sensitive Data from a known child under 13 years of age, or 3) to sell, or process Personal Data for
                Targeted Advertising of a consumer at least 13 years of age but younger than 16 years of age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the CTDPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the CTDPA. We will not deny you
                our goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the CTDPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the CTDPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="delaware-resident-rights">Delaware Resident Rights<@lgcode/h2>
              <p>
                If you are a Delaware resident, you have the rights set forth under the Delaware Personal Data Privacy
                Act ("DPDPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Delaware resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access and request a copy of your Personal Data in a machine-readable format, to the extent technically
                feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the DPDPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the DPDPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic circumstances, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                DPDPA that concern you. To our knowledge, we do not process the Personal Data of consumers under 18
                years of age for the purpose of Profiling.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, 2)
                Sensitive Data from a known child under 13 years of age, 3) or to sell, or process Personal Data for
                Targeted Advertising, or Profiling of a consumer at least 13 years of age but younger than 18 years of
                age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the DPDPA. We will not deny you
                our goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the DPDPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the DPDPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="iowa-resident-rights">Iowa Resident Rights<@lgcode/h2>
              <p>
                If you are an Iowa resident, you have the rights set forth under the Iowa Consumer Data Protection Act
                ("ICDPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are an Iowa resident, the portion that is more protective of Personal Data shall control to the extent
                of such conflict. If you have any questions about this section or whether any of the following rights
                apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access and request a copy of your Personal Data in a machine-readable format, to the extent technically
                feasible, twice within a calendar year.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us.<@lgcode/p>

              <h3>Opt-Out of Certain Processing Activities<@lgcode/h3>
              <ul>
                <li>Targeted Advertising: We do not process your Personal Data for targeted advertising purposes.<@lgcode/li>
                <li>Sale of Personal Data: We do not currently sell your Personal Data as defined under the ICDPA.<@lgcode/li>
                <li>Processing of Sensitive Personal Data: We do not process Sensitive Personal Data.<@lgcode/li>
              <@lgcode/ul>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the ICDPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the ICDPA. We will not deny you
                our goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the ICDPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the ICDPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="montana-resident-rights">Montana Resident Rights<@lgcode/h2>
              <p>
                If you are a Montana resident, you have the rights set forth under the Montana Consumer Data Privacy Act
                ("MCDPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Montana resident, the portion that is more protective of Personal Data shall control to the extent
                of such conflict. If you have any questions about this section or whether any of the following rights
                apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the MCDPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the MCDPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic circumstances, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                MCDPA that concern you. To our knowledge, we do not process the Personal Data of consumers under 16
                years of age for the purpose of Profiling.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, 2)
                Sensitive Data from a known child under 13 years of age, or 3) to sell, or process Personal Data for
                Targeted Advertising or Profiling of a consumer at least 13 years of age but younger than 16 years of
                age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the MCDPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the MCDPA. We will not deny you
                our goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the MCDPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the MCDPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="nebraska-resident-rights">Nebraska Resident Rights<@lgcode/h2>
              <p>
                If you are a Nebraska resident, you have the rights set forth under the Nebraska Data Privacy Act
                ("NDPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Nebraska resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible, twice within a calendar year.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the NDPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the NDPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic circumstances, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                NDPA that concern you.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data and
                2) Sensitive Data from a known child under 13 years of age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the NDPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the NDPA. We will not deny you our
                goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the NDPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the NDPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="new-hampshire-resident-rights">New Hampshire Resident Rights<@lgcode/h2>
              <p>
                If you are a New Hampshire resident, you have the rights set forth under the New Hampshire Privacy Act
                ("NHPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a New Hampshire resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the NHPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the NHPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic circumstances, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                NHPA that concern you.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data and
                2) Sensitive Data from a known child under 13 years of age, 3) or to sell or process Personal Data for
                Targeted Advertising of a consumer at least 13 years of age but younger than 16 years of age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the NHPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the NHPA. We will not deny you our
                goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the NHPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the NHPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="new-jersey-resident-rights">New Jersey Resident Rights<@lgcode/h2>
              <p>
                If you are a New Jersey resident, you have the rights set forth under the New Jersey Privacy Act
                ("NJPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a New Jersey resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access and request a copy of your Personal Data in a machine-readable format, to the extent technically
                feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data concerning you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the NJPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the NJPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic circumstances, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                NJPA that concern you. To our knowledge, we do not process the Personal Data of consumers under 17 years
                of age for the purpose of Profiling.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, 2)
                Sensitive Data from a known child under 13 years of age, 3) or to sell, or process Personal Data for
                Targeted Advertising, or Profiling of a consumer at least 13 years of age but younger than 17 years of
                age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the NJPA. We will not deny you our
                goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the NJPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the NJPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="oregon-resident-rights">Oregon Resident Rights<@lgcode/h2>
              <p>
                If you are an Oregon resident, you have the rights set forth under the Oregon Consumer Privacy Act
                ("OCPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are an Oregon resident, the portion that is more protective of Personal Data shall control to the extent
                of such conflict. If you have any questions about this section or whether any of the following rights
                apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access and request a copy of your Personal Data, including a list of specific third parties, other than
                natural persons, to which we have disclosed your Personal Data or any Personal Data, in a
                machine-readable format, to the extent technically feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the OCPA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" to make "Decisions" under the OCPA. "Profiling"
                means any form of automated processing performed on personal data to evaluate, analyze or predict
                personal aspects related to an identified or identifiable individual's economic circumstances, health,
                personal preferences, interests, reliability, behavior, location or movements. "Decision" means any
                "Decisions that produce legal or similarly significant effects concerning a Consumer," as defined in the
                OCPA that concern you. To our knowledge, we do not process the Personal Data of consumers under 16 years
                of age for the purpose of Profiling.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, 2)
                Sensitive Data from a known child under 13 years of age, or 3) to sell, or process Personal Data for
                Targeted Advertising, or Profiling of a consumer at least 13 years of age but younger than 16 years of
                age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the OCPA. We will not deny you our
                goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the OCPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the OCPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="texas-resident-rights">Texas Resident Rights<@lgcode/h2>
              <p>
                If you are a Texas resident, you have the rights set forth under the Texas Data Privacy and Security Act
                ("TDPSA"). Please see the "Exercising Your Rights under the State Privacy Laws" section below for
                instructions regarding how to exercise these rights. Please note that we may process Personal Data of
                our customers' end users or employees in connection with our provision of certain services to our
                customers. If we are processing your Personal Data as a service provider, you should contact the entity
                that collected your Personal Data in the first instance to address your rights with respect to such
                data. Additionally, please note that these rights are subject to certain conditions and exceptions under
                applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Texas resident, the portion that is more protective of Personal Data shall control to the extent
                of such conflict. If you have any questions about this section or whether any of the following rights
                apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible, twice within a calendar year.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Personal Data Sales Opt-Out<@lgcode/h3>
              <p>
                We do not currently sell or process for the purposes of targeted advertising your Personal Data as
                defined under the TDPSA.
              <@lgcode/p>

              <h3>Profiling Opt-Out<@lgcode/h3>
              <p>
                We do not process your Personal Data for "Profiling" as defined under the TDPSA. "Profiling" means any
                form of solely automated processing performed on personal data to evaluate, analyze, or predict personal
                aspects related to an identified or identifiable individual's economic situation, health, personal
                preferences, interests, reliability, behavior, location, or movements.
              <@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, or
                2) Sensitive Data from a known child under 13 years of age.
              <@lgcode/p>

              <p>However, we currently do not collect or process your Personal Data as described above.<@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the TDPSA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the TDPSA. We will not deny you
                our goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the TDPSA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the TDPSA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="utah-resident-rights">Utah Resident Rights<@lgcode/h2>
              <p>
                If you are a Utah resident, you have the rights set forth under the Utah Consumer Privacy Act ("UCPA").
                Please see the "Exercising Your Rights under the State Privacy Laws" section below for instructions
                regarding how to exercise these rights. Please note that we may process Personal Data of our customers'
                end users or employees in connection with our provision of certain services to our customers. If we are
                processing your Personal Data as a service provider, you should contact the entity that collected your
                Personal Data in the first instance to address your rights with respect to such data. Additionally,
                please note that these rights are subject to certain conditions and exceptions under applicable law,
                which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Utah resident, the portion that is more protective of Personal Data shall control to the extent of
                such conflict. If you have any questions about this section or whether any of the following rights apply
                to you, please contact us at help@anoma.ly.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data that you have provided to us.<@lgcode/p>

              <h3>Opt-Out of Certain Processing Activities<@lgcode/h3>
              <ul>
                <li>Targeted Advertising: We do not process your Personal Data for targeted advertising purposes.<@lgcode/li>
                <li>Sale of Personal Data: We do not currently sell your Personal Data as defined under the UCPA.<@lgcode/li>
                <li>Processing of Sensitive Personal Data: We do not process Sensitive Personal Data.<@lgcode/li>
              <@lgcode/ul>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the UCPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the UCPA. We will not deny you our
                goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the UCPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the UCPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="virginia-resident-rights">Virginia Resident Rights<@lgcode/h2>
              <p>
                If you are a Virginia resident, you have the rights set forth under the Virginia Consumer Data
                Protection Act ("VCDPA"). Please see the "Exercising Your Rights under the State Privacy Laws" section
                below for instructions regarding how to exercise these rights. Please note that we may process Personal
                Data of our customers' end users or employees in connection with our provision of certain services to
                our customers. If we are processing your Personal Data as a service provider, you should contact the
                entity that collected your Personal Data in the first instance to address your rights with respect to
                such data. Additionally, please note that these rights are subject to certain conditions and exceptions
                under applicable law, which may permit or require us to deny your request.
              <@lgcode/p>

              <p>
                If there are any conflicts between this section and any other provision of this Privacy Policy and you
                are a Virginia resident, the portion that is more protective of Personal Data shall control to the
                extent of such conflict. If you have any questions about this section or whether any of the following
                rights apply to you, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>.
              <@lgcode/p>

              <h3>Access and Portability<@lgcode/h3>
              <p>
                You have the right to request confirmation of whether or not we are processing your Personal Data and to
                access your Personal Data, and request a copy of your Personal Data in a machine-readable format, to the
                extent technically feasible.
              <@lgcode/p>

              <h3>Correction<@lgcode/h3>
              <p>
                You have the right to correct inaccuracies in your Personal Data, to the extent such correction is
                appropriate in consideration of the nature of such data and our purposes of processing your Personal
                Data.
              <@lgcode/p>

              <h3>Deletion<@lgcode/h3>
              <p>You have the right to delete Personal Data you have provided to us or we have obtained about you.<@lgcode/p>

              <h3>Consent or "Opt-in" Required and How to Withdraw<@lgcode/h3>
              <p>
                We may seek your consent to collect or process certain Personal Data, including: 1) Sensitive Data, or
                2) Sensitive Data from a known child under 13 years of age.
              <@lgcode/p>

              <p>However, we currently do not collect or process Personal data as described above.<@lgcode/p>

              <h3>Opt-Out of Certain Processing Activities<@lgcode/h3>
              <ul>
                <li>Targeted Advertising: We do not process your Personal Data for targeted advertising purposes.<@lgcode/li>
                <li>Sale of Personal Data: We do not currently sell your Personal Data as defined under the VDCPA.<@lgcode/li>
                <li>
                  Processing for Profiling Purposes: We do not currently process your Personal Data for the purposes of
                  profiling.
                <@lgcode/li>
              <@lgcode/ul>

              <p>
                To exercise any of your rights for these certain processing activities, please follow the instructions
                under the "Exercising Your Rights under the State Privacy Laws" section.
              <@lgcode/p>

              <h3>We Will Not Discriminate Against You for Exercising Your Rights Under the VCDPA<@lgcode/h3>
              <p>
                We will not discriminate against you for exercising your rights under the VCDPA. We will not deny you
                our goods or services, charge you different prices or rates, or provide you a lower quality of goods and
                services if you exercise your rights under the VCDPA. However, we may offer different tiers of our
                Services as allowed by applicable data privacy laws (including the VCDPA) with varying prices, rates or
                levels of quality of the goods or services you receive related to the value of Personal Data that we
                receive from you.
              <@lgcode/p>

              <h2 id="exercising-your-rights">Exercising Your Rights under the State Privacy Laws<@lgcode/h2>
              <p>
                To exercise the rights described in this Privacy Policy, you or, if you are a California, Colorado,
                Connecticut, Delaware, Montana, Nebraska, New Hampshire, New Jersey, Oregon or Texas resident, your
                Authorized Agent (defined below) must send us a request that (1) provides sufficient information to
                allow us to verify that you are the person about whom we have collected Personal Data, and (2) describes
                your request in sufficient detail to allow us to understand, evaluate and respond to it. Each request
                that meets both of these criteria will be considered a "Valid Request." We may not respond to requests
                that do not meet these criteria. We will only use Personal Data provided in a Valid Request to verify
                your identity and complete your request. You do not need an account to submit a Valid Request.
              <@lgcode/p>

              <p>
                We will work to respond to your Valid Request within the time period required by applicable law. We will
                not charge you a fee for making a Valid Request unless your Valid Request(s) is excessive, repetitive or
                manifestly unfounded. If we determine that your Valid Request warrants a fee, we will notify you of the
                fee and explain that decision before completing your request.
              <@lgcode/p>

              <h3>Request to Withdraw Consent to Certain Processing Activities<@lgcode/h3>
              <p>
                If you are a California resident, you may withdraw your consent allowing us: 1) to sell or share your
                Personal Data, by using the following method:
              <@lgcode/p>
              <ul>
                <li>
                  Email us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>
                <@lgcode/li>
                <li>Call us at: +1 415 794-0209<@lgcode/li>
              <@lgcode/ul>

              <h3>Request to Access, Delete, or Correct<@lgcode/h3>
              <p>
                You may submit a Valid Request for any other rights afforded to you in this Privacy Policy by using the
                following methods:
              <@lgcode/p>
              <ul>
                <li>
                  Email us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>
                <@lgcode/li>
                <li>Call us at: +1 415 794-0209<@lgcode/li>
              <@lgcode/ul>

              <p>
                If you are a California, Colorado, Connecticut, Delaware, Montana, Nebraska, New Hampshire, New Jersey,
                Oregon or Texas resident, you may also authorize an agent (an "Authorized Agent") to exercise your
                rights on your behalf. To do this, you must provide your Authorized Agent with written permission to
                exercise your rights on your behalf, and we may request a copy of this written permission from your
                Authorized Agent when they make a request on your behalf.
              <@lgcode/p>

              <h3>Appealing a Denial<@lgcode/h3>
              <p>
                If you are a Colorado, Connecticut, Delaware, Iowa, Montana, Nebraska, New Hampshire, New Jersey,
                Oregon, Texas or Virginia resident and we refuse to take action on your request within a reasonable
                period of time after receiving your request in accordance with this section, you may appeal our
                decision. In such appeal, you must (1) provide sufficient information to allow us to verify that you are
                the person about whom the original request pertains and to identify the original request, and (2)
                provide a description of the basis of your appeal. Please note that your appeal will be subject to your
                rights and obligations afforded to you under the State Privacy Laws (as applicable). We will respond to
                your appeal within the time period required under the applicable law. You can submit a Verified Request
                to appeal by the following methods:
              <@lgcode/p>
              <ul>
                <li>
                  Email us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>
                <@lgcode/li>
                <li>Call us at: +1 415 794-0209<@lgcode/li>
              <@lgcode/ul>

              <p>
                If we deny your appeal, you have the right to contact the Attorney General of your State, including by
                the following links: Colorado, Connecticut, Delaware, Iowa, Montana, Nebraska, New Hampshire, New
                Jersey, Oregon, Texas and Virginia.
              <@lgcode/p>

              <h2 id="other-state-law-privacy-rights">Other State Law Privacy Rights<@lgcode/h2>

              <h3>California Resident Rights<@lgcode/h3>
              <p>
                Under California Civil Code Sections 1798.83-1798.84, California residents are entitled to contact us to
                prevent disclosure of Personal Data to third parties for such third parties' direct marketing purposes;
                in order to submit such a request, please contact us at <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>
                .
              <@lgcode/p>

              <p>
                Your browser may offer you a "Do Not Track" option, which allows you to signal to operators of websites
                and web applications and services that you do not wish such operators to track certain of your online
                activities over time and across different websites. Our Services do not support Do Not Track requests at
                this time. To find out more about "Do Not Track," you can visit{" "}
                <a href="http:@lgcode/@lgcode/www.allaboutdnt.com">www.allaboutdnt.com<@lgcode/a>.
              <@lgcode/p>

              <h3>Nevada Resident Rights<@lgcode/h3>
              <p>
                Please note that we do not currently sell your Personal Data as sales are defined in Nevada Revised
                Statutes Chapter 603A.
              <@lgcode/p>

              <h2 id="contact-information">Contact Information<@lgcode/h2>
              <p>
                If you have any questions or comments about this Privacy Policy, the ways in which we collect and use
                your Personal Data or your choices and rights regarding such collection and use, please do not hesitate
                to contact us at:
              <@lgcode/p>
              <ul>
                <li>
                  Email: <a href="mailto:help@anoma.ly">help@anoma.ly<@lgcode/a>
                <@lgcode/li>
                <li>Phone: +1 415 794-0209<@lgcode/li>
                <li>Address: 2443 Fillmore St #380-6343, San Francisco, CA 94115, United States<@lgcode/li>
              <@lgcode/ul>
            <@lgcode/article>
          <@lgcode/section>
        <@lgcode/div>
        <Footer @lgcode/>
      <@lgcode/div>
      <Legal @lgcode/>
    <@lgcode/main>
  )
}
