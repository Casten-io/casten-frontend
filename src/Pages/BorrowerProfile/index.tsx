import { useState, SyntheticEvent } from "react";
import "./borrower.scss";
import {
  InputAdornment,
  OutlinedInput,
  Backdrop,
  Slider,
  Fade,
  Box,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Office from "../../assets/icons/office.png";
import QuickCheck from "../../assets/icons/quick-check.jpg";
import ArrowNE from "../../assets/icons/Arrow-NorthEast.svg";
import InfoIcon from "../../assets/icons/info.svg";
import Twitter from "../../assets/icons/twitter.svg";
import LinkedIn from "../../assets/icons/linkedin.svg";
import WebsiteIcon from "../../assets/icons/website.svg";
import BlankProgress from '../../assets/images/blank-progress.png'
import { ArrowNorthEast } from '../../components/Drawer/drawer-content/icons';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});
function BorrowerProfile() {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <>
      <Box sx={{ px: '1.25rem' }}>
        <Box sx={{
          mx: 'auto',
          minHeight: '100%',
          maxWidth: '80rem',
          py: '3.5rem',
        }}>
          <div className="borrower-profile-grid">
            <div className="heading">
              <div className="heading-title">
                <div>
                  <div className="heading-title-one">
                    <img src={QuickCheck} alt="quick-check-1"/>
                    QuickCheck Pool #1
                  </div>
                </div>
                <a
                  className="borrower-contract-link"
                  // href="https://polygonscan.com/address/0xA3EB50Cf1D0047bD08432f9fBDdAE43Bb022f83f"
                  href="#"
                  target="_blank"
                  rel="noopener"
                >
                  Contract <img src={ArrowNE} alt="arrow-north-east"/>
                </a>
              </div>
              <div className="main-title">
                QuickCheck Pool #1
              </div>
              <div>
                <div className="sub-title" style={{ width: '6.40244%' }}>
                  Supplied
                  <span>$0</span>
                </div>
                <div className="goal-progress" style={{ backgroundImage: `url('${BlankProgress}')` }}>
                  <div className="red" style={{width: '1.28049%'}}><div className="full-box"/></div>
                  <div className="gray" style={{width: '5.12195%'}}><div className="full-box"/></div>
                </div>
              </div>
              <div className="goal-value">
                Goal
                <span>
                  $200,000.00
                </span>
              </div>
            </div>
            <div className="side-area"><div/></div>
            <div className="tab-area">
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" className="tab-list">
                <Tab label="Deal Overview" className="tab-button" {...a11yProps(0)} />
                <Tab label="Borrower Profile" className="tab-button" {...a11yProps(1)} />
              </Tabs>
              <TabPanel index={0} value={value}>
                <div>
                  <div className="tab-content">
                    <div>
                      <div className="deal-overview section" style={{ marginBottom: '0.5rem' }}>
                        <h2 className="title">
                          <a
                            href="https://docsend.com/view/s/hr387j9ft6kut5wg"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Deal Overview
                          </a>
                        </h2>
                        {/*<div className="text-content">*/}
                        {/*<span>*/}
                        {/*  Proceeds will be used to provide additional backing to African fintechs in their quest to provide access to financial services to millions of traditionally underbanked customers. Our investments will include senior secured loans with covenants for additional downside protection. All loans will be secured by all-asset debentures, including our borrowers' lending receivables.*/}
                        {/*</span>*/}
                        {/*</div>*/}
                      </div>
                      {/*<div className="highlights section">*/}
                      {/*  <h2 className="title"><span>Highlights</span></h2>*/}
                      {/*  <ul className="list">*/}
                      {/*    <li><span className="">Cauris uses data-driven approaches to underwriting and portfolio management efforts and a combination of strong asset-level underwriting, structural and legal protections and advanced analytics to secure our debt investments in all fintech partners.</span>*/}
                      {/*    </li>*/}
                      {/*    <li><span className="">Cauris only invests in Fintechs characterized by management teams with deep, relevant experience in their companies' sectors; well-performing loan books to use as collateral; and support by marquee VC, PE and strategic investors.</span>*/}
                      {/*    </li>*/}
                      {/*    <li><span className="">Pool investments will target companies providing consumer and SME lending products as well as trade and equipment financing.</span>*/}
                      {/*    </li>*/}
                      {/*  </ul>*/}
                      {/*</div>*/}
                      <div className="section">
                        <div>
                          <div className="chain-data">
                            <div className="title">
                              <h2>On-chain data</h2>
                              <div className="info-btn">
                                <div>
                                  <img src={InfoIcon} alt="info-icon"/>
                                </div>
                              </div>
                            </div>
                            <a
                              className="borrower-contract-link"
                              // href="https://polygonscan.com/address/0xA3EB50Cf1D0047bD08432f9fBDdAE43Bb022f83f"
                              href="#"
                              target="_blank"
                              rel="noopener">Contract
                              <img src={ArrowNE} alt="arrow-north-east"/>
                            </a>
                          </div>
                          <div className="table">
                            <table className="chain-data-table">
                              <tbody>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Initial pool size</div>
                                  </div>
                                </th>
                                <td>USD 200,000</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Pool purpose</div>
                                  </div>
                                </th>
                                <td>
                                  To lend to micro, small and medium business (MSMBs) in Nigeria
                                </td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Term</div>
                                  </div>
                                </th>
                                <td>180 days - bullet payment</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Coupon financing rate</div>
                                  </div>
                                </th>
                                <td>18%</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Payment Frequency </div>
                                  </div>
                                </th>
                                <td>Monthly</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Deal type</div>
                                  </div>
                                </th>
                                <td>Multiple tranches</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Opening date</div>
                                  </div>
                                </th>
                                <td>13 March 2023</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Security</div>
                                  </div>
                                </th>
                                <td>
                                  <ul>
                                    <li>
                                      First priority liens on Senior secured loans to micro, small and medium business
                                      (MSMBs) and separately managed in the SPV created for the pool up to a value of
                                      150%
                                    </li>
                                    <li>
                                      Borrower to contribute 10% of the pool size in to the junior tranche as cash
                                      security
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Other important covenants</div>
                                  </div>
                                </th>
                                <td>
                                  <ul>
                                    <li>
                                      Maintain the lien security at all times during the duration of the pool in the
                                      SPV. If any of the underlying loan is delayed or defaulted, the same shall be
                                      replaced with a good performing loan in the SPV as part of the collateral
                                    </li>
                                    <li>
                                      Submit report on the collateral performance on a monthly basis
                                    </li>
                                    <li>
                                      Submit monthly information report on the overall loan performance of the Arve SPV
                                      Limited[Fintech company name] in the agreed upon format
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Contract Address</div>
                                  </div>
                                </th>
                                <td>
                                  <ul>
                                    <li>
                                      <a
                                        className="link"
                                        href="https://polygonscan.com/address/0xDb178D0cd0D28470a354921E257B9b0988Ff7e38"
                                        target="_blank"
                                        style={{ display: 'none' }}
                                      >
                                        0xDb178D0cd0D28470a354921E257B9b0988Ff7e38
                                      </a>
                                      -
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Borrower Address</div>
                                  </div>
                                </th>
                                <td>
                                  <ul>
                                    <li>
                                      <a
                                        className="link"
                                        href="https://polygonscan.com/address/0x428995b6b3e2ed27387ce15d224c2e669a284bc0"
                                        target="_blank"
                                        style={{ display: 'none' }}
                                      >
                                        0x428995b6b3e2ed27387ce15d224c2e669a284bc0
                                      </a>
                                      -
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              </tbody>
                              <tbody style={{ display: 'none' }}>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Interest</div>
                                  </div>
                                </th>
                                <td>13.5%</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Drawdowncap</div>
                                  </div>
                                </th>
                                <td>$200,000.00</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Opening Date</div>
                                  </div>
                                </th>
                                <td>6<sup>th</sup> March 2023</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Contract Address</div>
                                  </div>
                                </th>
                                <td>
                                  <ul>
                                    <li>
                                      <a
                                        className="link"
                                        href="https://polygonscan.com/address/0xDb178D0cd0D28470a354921E257B9b0988Ff7e38"
                                        target="_blank"
                                        style={{ display: 'none' }}
                                      >
                                        0xDb178D0cd0D28470a354921E257B9b0988Ff7e38
                                      </a>
                                      -
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Borrower Address</div>
                                  </div>
                                </th>
                                <td>
                                  <ul>
                                    <li>
                                      <a
                                        className="link"
                                        href="https://polygonscan.com/address/0x428995b6b3e2ed27387ce15d224c2e669a284bc0"
                                        target="_blank"
                                        style={{ display: 'none' }}
                                      >
                                        0x428995b6b3e2ed27387ce15d224c2e669a284bc0
                                      </a>
                                      -
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="section recent-activity" style={{ display: 'none' }}>
                        <h2 className="title">Recent Activity</h2>
                        <div className="table-area">
                          <div className="table-sub-area">
                            <table>
                              <thead>
                              <tr>
                                <th>User</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Link</th>
                              </tr>
                              </thead>
                              <tbody>
                              {/*<tr>*/}
                              {/*  <td>*/}
                              {/*    <div>*/}
                              {/*      <button className="address-btn">*/}
                              {/*        <span>0x1e10...13db</span>*/}
                              {/*      </button>*/}
                              {/*    </div>*/}
                              {/*  </td>*/}
                              {/*  <td>*/}
                              {/*    <div className="text-left">Withdrawal</div>*/}
                              {/*  </td>*/}
                              {/*  <td>*/}
                              {/*    <div>-$500.00 USDC</div>*/}
                              {/*  </td>*/}
                              {/*  <td>*/}
                              {/*    <div>Nov 24, 2022</div>*/}
                              {/*  </td>*/}
                              {/*  <td>*/}
                              {/*    <a*/}
                              {/*      className="link"*/}
                              {/*      target="_blank"*/}
                              {/*      rel="noopener noreferrer"*/}
                              {/*      href="https://etherscan.io/tx/0x42f481bd81071f96fb95f5832a78cffa7ef8c12ec8a60c6b0b3c5cd5e8a113e8"*/}
                              {/*    >*/}
                              {/*      Tx*/}
                              {/*      <ArrowNorthEast*/}
                              {/*        size="20"*/}
                              {/*        fill="rgb(168 162 158/1)"*/}
                              {/*      />*/}
                              {/*    </a></td>*/}
                              {/*</tr>*/}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel index={1} value={value}>
                <div>
                  <div className="tab-content">
                    <div className="borrower-profile">
                      <div>
                        <div className="title">
                          <div className="main-title">
                            <div className="names">
                              <img src={QuickCheck} alt="cauris-2"/>
                              <h2>QuickCheck</h2>
                            </div>
                            <div className="social-btns">
                              <div className="social-btn">
                                <img src={WebsiteIcon} alt="website"/>
                                <a
                                  className="link"
                                  target="_blank"
                                  rel="noreferrer"
                                  href="https://quickcheck.ng/"
                                >
                                  <span>Website</span>
                                </a>
                              </div>
                              <div className="social-btn">
                                <img src={LinkedIn} alt="linkedin"/>
                                <a
                                  className="link"
                                  target="_blank"
                                  rel="noreferrer"
                                  href="https://www.linkedin.com/company/quickcheck-nigeria/"
                                >
                                  <span>LinkedIn</span>
                                </a>
                              </div>
                              <div className="social-btn">
                                <img src={Twitter} alt="twitter"/>
                                <a
                                  className="link"
                                  target="_blank"
                                  rel="noreferrer"
                                  href="https://twitter.com/quickcheckng"
                                >
                                  <span>Twitter</span>
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="sub-title" style={{ display: 'none' }}>
                            Africa fintech credit fund
                          </div>
                        </div>
                      </div>
                      <div className="profile-content profile-section">
                        <p style={{ marginBottom: '2rem' }}>
                          QuickCheck is a Fintech Company specialized in digital lending to SMEs. The Company was
                          founded in September 2017 with the goal of driving financial inclusion and providing access to
                          credit in Nigeria. The Company grants short-term loans of NGN30,000 –
                          NGN1,000,000 ($70 - $2400) for 30 – 360 days based on eligibility criteria built around its
                          credit scoring model. QuickCheck provides
                          productive credit with responsible pricing targeted at entrepreneur’s through a superior user
                          experience.<br/><br/>
                          With an underbanked/financially excluded adult population (100m) of greater than 50% and less
                          than 5% having access to credit, QuickCheck seeks to bridge this huge gap using its strong
                          underwriting capabilities and unique credit scoring model. QuickCheck has disbursed loans of
                          over $50 million to 1.1 million users since inception out of 3.3 million applications.
                        </p>
                        <h3 className="highlights-title" style={{marginBottom: '0.5rem'}}>
                          Team
                        </h3>
                        <p style={{ marginBottom: '2rem' }}>
                          The Company is also led by a strong management team with relevant experience in Management
                          Consulting (McKinsey), Technology and Artificial Intelligence (The European Organization for
                          Nuclear Research - CERN), Corporate and Investment Banking/Treasury (Coronation Merchant Bank)
                          and Credit Risk (UBA). The Company also has the presence of board members/shareholders with
                          proven track record of successful performance in the domestic banking industry
                        </p>
                        <h3 className="highlights-title">
                          Loan Originations and underlying exposure
                        </h3>
                        <h4 className="highlights-sub-title">
                          How they source the loans
                        </h4>
                        <p style={{ marginBottom: '0.2rem' }}>
                          QuickCheck uses various digital advertising platforms such as facebook and google to provide
                          visibility to the app and attract target customers. QuickCheck also leverages on its presence
                          in other social media platforms to publicize the app. Users download the app through google
                          playstore and apply for the loan through the app. <br/><br/>
                          In line with agreed data privacy agreements, behavioural data is obtained directly from
                          smartphones requesting for Customers’ data on:
                        </p>
                        <ul className="highlights-points dashes">
                          <li>
                            Age, Occupation, Geolocation, Phone logs, Social Media, Contacts, Device Storage, etc. some
                            of which are through synchronization with the users’ phones
                          </li>
                        </ul>
                        <p style={{ marginBottom: '0.2rem' }}>
                          Also, QuickCheck is integrated with various platforms via API to obtain financial data on:
                        </p>
                        <ul className="highlights-points dashes">
                          <li>
                            Credit History, Account Statement, Fraud detection through integration with global fraud
                            detection experts, etc.
                          </li>
                        </ul>
                        <h4 className="highlights-sub-title">
                          How they decide to lend
                        </h4>
                        <p>
                          Using a unique credit scoring model and algorithm driven by AI and machine learning to build
                          risk profiles based on the collected data on prospective borrowers, prospective borrowers are
                          segmented into different risk categories with returning users that have relatively long
                          repayment history assigned to a lower risk category. We calculate the repayment probability
                          based on the input from data and disburse loans to users with higher repayment probability.
                        </p>
                      </div>
                      <div className="profile-section borrower-finance" style={{ display: 'none' }}>
                        <h2 className="title">
                          Borrower Financials
                        </h2>
                        <div className="table" style={{overflow: 'auto'}}>
                          <table className="chain-data-table">
                            <tbody>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Interest</div>
                                </div>
                              </th>
                              <td>16.2%</td>
                            </tr>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Drawdowncap</div>
                                </div>
                              </th>
                              <td>$200,000.00</td>
                            </tr>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Opening Date</div>
                                </div>
                              </th>
                              <td>6<sup>th</sup> March 2023</td>
                            </tr>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Contract Address</div>
                                </div>
                              </th>
                              <td>
                                <ul>
                                  <li>
                                    {/*<a*/}
                                    {/*  className="link"*/}
                                    {/*  href="https://polygonscan.com/address/0xABC38F394CfC5b5c544fD4A38ef8A9a66aBE48B7"*/}
                                    {/*  target="_blank"*/}
                                    {/*>*/}
                                    {/*  0xABC38F394CfC5b5c544fD4A38ef8A9a66aBE48B7*/}
                                    {/*</a>*/}
                                    -
                                  </li>
                                </ul>
                              </td>
                            </tr>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Borrower Address</div>
                                </div>
                              </th>
                              <td>
                                <ul>
                                  <li>
                                    {/*<a*/}
                                    {/*  className="link"*/}
                                    {/*  href="https://polygonscan.com/address/0x428995b6b3e2ed27387ce15d224c2e669a284bc0"*/}
                                    {/*  target="_blank"*/}
                                    {/*>*/}
                                    {/*  0x428995b6b3e2ed27387ce15d224c2e669a284bc0*/}
                                    {/*</a>*/}
                                    -
                                  </li>
                                </ul>
                              </td>
                            </tr>
                            {/*<tr className="border border-sand-200">*/}
                            {/*  <th scope="row">*/}
                            {/*    <div>*/}
                            {/*      <div className="th-title">Off-chain debt providers</div>*/}
                            {/*    </div>*/}
                            {/*  </th>*/}
                            {/*  <td>*/}
                            {/*    <ul>*/}
                            {/*      <li>Undisclosed VC firm</li>*/}
                            {/*    </ul>*/}
                            {/*  </td>*/}
                            {/*</tr>*/}
                            {/*<tr className="border border-sand-200">*/}
                            {/*  <th scope="row">*/}
                            {/*    <div>*/}
                            {/*      <div className="th-title">Audited</div>*/}
                            {/*    </div>*/}
                            {/*  </th>*/}
                            {/*  <td>No</td>*/}
                            {/*</tr>*/}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </div>
          </div>
        </Box>
      </Box>
    </>
  );
}

export default BorrowerProfile;
