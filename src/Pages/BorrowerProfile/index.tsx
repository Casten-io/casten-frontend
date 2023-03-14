import { useState, SyntheticEvent, useEffect } from "react";
import "./borrower.scss";
import {
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import Cauris from "../../assets/icons/cauris-1.jpg";
import ArrowNE from "../../assets/icons/Arrow-NorthEast.svg";
import InfoIcon from "../../assets/icons/info.svg";
import Twitter from "../../assets/icons/twitter.svg";
import LinkedIn from "../../assets/icons/linkedin.svg";
import WebsiteIcon from "../../assets/icons/website.svg";
import BlankProgress from '../../assets/images/blank-progress.png'
import { createClient } from 'urql';
import { subgraphUrl } from '../../constants';
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
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [poolDetails, setPoolDetails] = useState<any>({
    currentIssuance: '0',
    totalIssuance: '0',
  })
  const fetchPoolDetails = async () => {
    const client = createClient({
      url: subgraphUrl,
    });

    const resp = await client.query(
      `query {
        pools {
          id
          data {
            name
            shelfAddress
            coordinatorAddress
            memberlistAddress
            seniorTrancheAddress
            seniorTrancheAddress
            juniorTrancheAddress
            seniorOperatorAddress
            juniorOperatorAddress
            reserveAddress
          }
          seniorTVL
          juniorTVL
          expectedSeniorAPY
          expectedJuniorAPY
          totalIssuance
          currentIssuance
          seniorTranche {
            id
            tokenName
            tokenSymbol
            name
            tokenPrice
          }
          juniorTranche {
            id
            tokenName
            tokenSymbol
            name
            tokenPrice
          }
          repaymentFrequency
        }
      }`,
      {},
    ).toPromise();

    const pool = resp.data.pools[0];
    setCurrentPercentage(Number(BigInt(pool.currentIssuance) / BigInt(10 ** 6)) * 100 / Number(BigInt(pool.totalIssuance) / BigInt(10 ** 6)));
    setPoolDetails(pool);
  };

  useEffect(() => {
    fetchPoolDetails()
      .catch((error) => {
        console.error('error while fetching pools: ', error);
      });
  }, []);

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
                    <img src={Cauris} alt="cauris-1"/>
                    Cauris Pool #1
                  </div>
                </div>
                <a
                  className="borrower-contract-link"
                  href="https://etherscan.io/address/0xd43a4f3041069c6178b99d55295b00d0db955bb5" target="_blank"
                  rel="noopener">Contract
                  <img src={ArrowNE} alt="arrow-north-east"/>
                </a>
              </div>
              <div className="main-title">
                Cauris Pool #1
              </div>
              <div>
                <div className="sub-title" style={{ marginLeft: `${currentPercentage}%` }}>
                  Supplied
                  <span>{Number(BigInt(poolDetails.currentIssuance) / BigInt(10 ** 6)).toFixed(2)}</span>
                </div>
                <div className="goal-progress" style={{ backgroundImage: `url('${BlankProgress}')` }}>
                  {/*<div className="red" style={{ width: '1.28049%' }}>*/}
                  {/*  <div className="full-box"/>*/}
                  {/*</div>*/}
                  <div className="gray" style={{ width: `${currentPercentage}%` }}>
                    <div className="full-box"/>
                  </div>
                </div>
              </div>
              <div className="goal-value">
                Goal
                <span>
                  {Number(BigInt(poolDetails.totalIssuance) / BigInt(10 ** 6)).toFixed(2)} USDC
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
                      <div className="deal-overview section">
                        <h2 className="title">
                          <a
                            href="https://docsend.com/view/s/rd7p9syq4j2rfkmx"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Deal Overview
                          </a>
                        </h2>
                        <div className="text-content">
                        <span>
                          Proceeds will be used to provide additional backing to African fintechs in their quest to provide access to financial services to millions of traditionally underbanked customers. Our investments will include senior secured loans with covenants for additional downside protection. All loans will be secured by all-asset debentures, including our borrowers' lending receivables.
                        </span>
                        </div>
                      </div>
                      <div className="highlights section">
                        <h2 className="title"><span>Highlights</span></h2>
                        <ul className="list">
                          <li><span className="">Cauris uses data-driven approaches to underwriting and portfolio management efforts and a combination of strong asset-level underwriting, structural and legal protections and advanced analytics to secure our debt investments in all fintech partners.</span>
                          </li>
                          <li><span className="">Cauris only invests in Fintechs characterized by management teams with deep, relevant experience in their companies' sectors; well-performing loan books to use as collateral; and support by marquee VC, PE and strategic investors.</span>
                          </li>
                          <li><span className="">Pool investments will target companies providing consumer and SME lending products as well as trade and equipment financing.</span>
                          </li>
                        </ul>
                      </div>
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
                              href="https://etherscan.io/address/0xd43a4f3041069c6178b99d55295b00d0db955bb5" target="_blank"
                              rel="noopener">Contract
                              <img src={ArrowNE} alt="arrow-north-east"/>
                            </a>
                          </div>
                          <div className="table">
                            <table className="chain-data-table">
                              <tbody style={{ display: 'none' }}>
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Interest Rate</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>10.00%</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Drawdown cap</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>$10,000,000.00</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Payment frequency</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>30 days</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Payment term</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>1095 days</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Default interest rate</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>0.00%</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Deal type</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>Multitranche</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Current leverage ratio</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>4x</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Opening date</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>May 3, 2022</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Contract address</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>0xd43a4f3041069c6178b99d55295b00d0db955bb5</td>*/}
                              {/*</tr>*/}
                              {/*<tr>*/}
                              {/*  <th scope="row">*/}
                              {/*    <div>*/}
                              {/*      <div className="th-title">Borrower address</div>*/}
                              {/*      <div className="th-info">*/}
                              {/*        <img src={InfoIcon} alt="info-icon"/>*/}
                              {/*      </div>*/}
                              {/*    </div>*/}
                              {/*  </th>*/}
                              {/*  <td>0xd750033cd9ab91ead99074f671bbcbce0ffd91a8</td>*/}
                              {/*</tr>*/}
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
                                <td>$5,000,000.00</td>
                              </tr>
                              <tr className="border border-sand-200">
                                <th scope="row">
                                  <div>
                                    <div className="th-title">Opening Date</div>
                                  </div>
                                </th>
                                <td>1<sup>st</sup> Dec 2022</td>
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
                                        href="https://polygonscan.com/address/0xfeE0006935FbF1142aFbF15155932973f0c14973"
                                        target="_blank"
                                      >
                                        0xfeE0006935FbF1142aFbF15155932973f0c14973
                                      </a>
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
                                      >
                                        0x428995b6b3e2ed27387ce15d224c2e669a284bc0
                                      </a>
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="section recent-activity">
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
                              <tr>
                                <td>
                                  <div>
                                    <button className="address-btn">
                                      <span>0x1e10...13db</span>
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <div className="text-left">Withdrawal</div>
                                </td>
                                <td>
                                  <div>-$500.00 USDC</div>
                                </td>
                                <td>
                                  <div>Nov 24, 2022</div>
                                </td>
                                <td>
                                  <a
                                    className="link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://etherscan.io/tx/0x42f481bd81071f96fb95f5832a78cffa7ef8c12ec8a60c6b0b3c5cd5e8a113e8"
                                  >
                                    Tx
                                    <ArrowNorthEast
                                      size="20"
                                      fill="rgb(168 162 158/1)"
                                    />
                                  </a></td>
                              </tr>
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
                              <img src={Cauris} alt="cauris-2"/>
                              <h2>Cauris</h2>
                            </div>
                            <div className="social-btns">
                              <div className="social-btn">
                                <img src={WebsiteIcon} alt="website"/>
                                <a
                                  className="link"
                                  target="_blank"
                                  rel="noreferrer"
                                  href="https://www.caurisfinance.com/"
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
                                  href="https://www.linkedin.com/company/cauris-inc/"
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
                                  href="https://twitter.com/Caurisfinance"
                                >
                                  <span>Twitter</span>
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="sub-title">
                            Africa fintech credit fund
                          </div>
                        </div>
                      </div>
                      <div className="profile-content profile-section">
                        <p style={{marginBottom: '2rem'}}>
                          Cauris is a mission-driven investment firm that delivers growth capital to
                          best-in-class Fintechs and high risk-adjusted returns to investors. We aim to facilitate the
                          extension of financial services to 100 million people, accelerating the rise of the global
                          middle class and enabling economic growth in emerging markets.
                          Cauris's debt financing enables its partners to scale efforts that deliver financial services
                          to small businesses and consumers--many of which are traditionally underserved--that are the
                          economic engines of every economy. Leveraging cutting edge technology and highly structured
                          underwriting, Cauris delivers both consistent financial returns and compelling social impact.
                        </p>
                        <h3 className="highlights-title">
                          Highlights
                        </h3>
                        <ul className="highlights-points">
                          <li>
                            Founded by a team of former fintech entrepreneurs, operators, investment professionals and
                            bankers with expertise in credit and structured finance, direct experience working with
                            Fintechs in the Global South and deep industry experience in financial inclusion
                          </li>
                          <li>
                            Growing portfolio of fintech investments are supported by disciplined and robust
                            underwriting while enabling our fintechs partners to continue innovating and growing
                          </li>
                          <li>
                            Cauris has high-quality portfolio companies in Africa, Asia and Latin America; borrowers
                            are backed by marquee equity investors like A16Z, Tiger Global and the World Bank
                          </li>
                          <li>
                            Strong performance track record with $15M borrowed on Goldfinch to date, generating
                            healthy risk-adjusted yields for investors with zero delays or defaults in borrower
                            repayments
                          </li>
                        </ul>
                      </div>
                      <div className="profile-section borrower-finance">
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
                              <td>13.5%</td>
                            </tr>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Drawdowncap</div>
                                </div>
                              </th>
                              <td>$5,000,000.00</td>
                            </tr>
                            <tr className="border border-sand-200">
                              <th scope="row">
                                <div>
                                  <div className="th-title">Opening Date</div>
                                </div>
                              </th>
                              <td>1<sup>st</sup> Dec 2022</td>
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
                                      href="https://polygonscan.com/address/0xfeE0006935FbF1142aFbF15155932973f0c14973"
                                      target="_blank"
                                    >
                                      0xfeE0006935FbF1142aFbF15155932973f0c14973
                                    </a>
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
                                    >
                                      0x428995b6b3e2ed27387ce15d224c2e669a284bc0
                                    </a>
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
