import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMarkdown from 'react-markdown';
import Button from 'react-bootstrap/Button'
import Offcanvas from 'react-bootstrap/Offcanvas'
import OffcanvasHeader from 'react-bootstrap/OffcanvasHeader'
import OffcanvasTitle from 'react-bootstrap/OffcanvasTitle'
import OffcanvasBody from 'react-bootstrap/OffcanvasBody'
import ListGroup from 'react-bootstrap/ListGroup'

import { useMoralis } from "react-moralis";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;
  

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const { authenticate, isAuthenticated, user } = useMoralis();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const calculateTimeLeft = () => {
    let year = new Date().getFullYear();
    const difference = +new Date(`${year}-12-21`) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span>
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click Mint to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Congrats on the sweater! The ${CONFIG.NFT_NAME} is yours! View it on Opensea.io.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <s.Container
            flex={1}
            ai={"center"}
          >
          <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
                fontSize:"24px"
              }}
            >A percentage of the club tokens go to Toys for Tots. In addition, a random club member will get a gift from the Club!. 
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
                fontSize:"24px"
              }}
            >Mint an NFT. Join the club!  
            {/* <StyledLink target={"_blank"} href={"https://www.toysfortots.org"}>
                {truncate(" Read the Fine Print", 25)}
            </StyledLink> */}
            </s.TextDescription>
            
      <Button variant="primary" onClick={handleShow}>
        Fine Print
      </Button>

      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Ugly Xmas Sweater Club Gift</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
        <p>  After 100 Ugly Xmas Sweater Club NFTs have been minted, the club becomes eligible for a Christmas gift.     
          </p>
          <br></br>
          <p>
           One random club member will receive a gift between 3% and 15% of the accumulated tokens at the time of donation distribution. The amout being gifted depends on the number of NFTs minted. 
           The donation and gift tiers are described in a table on the main page. 
        The value of the accumulated tokens (MATIC, ETH, WETH) can fluctuate, so no exact value can be placed on the 
        gift at this time. The gift will be paid out in a token of which is to be determined, but 
        could be a combination of MATIC, WETH (wrapped eth on polygon) or ETH since those are the 
        tokens accepted in exchange for UxmasC NFTs.</p>
        <br></br>
        <p>
        The club member receiving the gift will be selected at random. A “club member” is any wallet that holds at least one UxmasC token.
            A random number generator will be used to select one of the minted Ugly Xmas Sweater Club NFTs’ number. For example, if 323 is selected, Ugly Xmas Sweater Club #323 NFTs’ holder will receive the gift.
            The gift will be given after the donation has been distributed,  and once  authorization has been given by the club accounting and administration or club creator. This event will be live streamed. More details to come.
            
        </p>

        </Offcanvas.Body>


      </Offcanvas>
          </s.Container>
        
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
          <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 26,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              <h1>Minting Ends </h1>
               {timerComponents.length ? timerComponents : <span>Time's up!</span>}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
                fontSize:"18px"
              }}
            >Visit <StyledLink target={"Toys for Tots"} href={"https://www.toysfortots.org"}>
                         {truncate(" ToysforTots.org ", 25)}
                    </StyledLink> to make a direct donation or learn more about the organization.
            </s.TextDescription>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Minting has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                        authenticate();
                      }}
                    >
                      CONNECT 
                    </StyledButton>
                    
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "Donate"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize:"20px",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the donation, you cannot undo this action. All transactions are final. 
            You must be a club member to win or vote.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We do not recommend lowering the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Container>
      <s.Container jc={"center"} ai={"center"} style={{ width: "100%", align:"center"}}>
      <Table striped bordered hover center variant="dark" >
        <thead>
          <tr>
            <th>Minted</th>
            <th>Donation Tier</th>
            <th>Prize Tier</th>
            <th>Est Token Donation (MATIC)</th>
            <th>Est Token Donation (MATIC)</th>
            <th>Club %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1-99</td>
            <td>55.0 %</td>
            <td>-</td>
            <td>8.55</td>
            <td>1362.0</td>
            <td>45.0 %</td>
          </tr>
          <tr>
            <td>100-499</td>
            <td>52.0 %</td>
            <td>3.0 %</td>
            <td>769.0</td>
            <td>3840.0</td>
            <td>45.0 %</td>
          </tr>
          <tr>
            <td>500-999</td>
            <td>50.0 %</td>
            <td>5.0 %</td>
            <td>3700.0</td>
            <td>7392.0</td>
            <td>45.0 %</td>
          </tr>
          <tr>
            <td>1000-1999</td>
            <td>48.0 %</td>
            <td>7.0 %</td>
            <td>7104.0</td>
            <td>14200.0</td>
            <td>45.0 %</td>
          </tr>
          <tr>
            <td>2000-2999</td>
            <td>46.0 %</td>
            <td>9.0 %</td>
            <td>13616.0</td>
            <td>20417.0</td>
            <td>45.0 %</td>
          </tr>
          <tr>
            <td>3000-3999</td>
            <td>44.0 %</td>
            <td>11.0 %</td>
            <td>19536.0</td>
            <td>26041.0</td>
            <td>45.0 %</td>
          </tr>
          <tr>
            <td>Sold Out</td>
            <td>40.0 %</td>
            <td>15.0 %</td>
            <td>23680.0</td>
            <td>23680.0</td>
            <td>45.0 %</td>
          </tr>
        </tbody>
      </Table>
      </s.Container>
      <s.SpacerLarge />
  <s.Container
          flex={2}
          jc={"center"}
          ai={"center"}
          style={{
            backgroundColor: "var(--accent)",
            
            padding: 24,
            borderRadius: 24,
            border: "4px dashed var(--secondary)",
            boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
          }}>
          <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> Toys for Tots
          </s.TextTitle>
          <s.TextDescription
            style={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >   Every year around Christmas, I make a donation to Toys for Tots. Some of my fondest childhood memories are opening toys on Christmas. 
              My family had a tradition where we’d open most our gifts Christmas Eve, and save one really special one for the morning. Now that I’m an adult, 
              I want to make sure as many kids as possible can get that experience of opening toys on Christmas.

            </s.TextDescription>

            <s.TextDescription
            style={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >  I am in no way affiliated with Toys for Tots. I am simply passionate about providing Christmas gifts. You can Donate to them directly if  <StyledLink target={"_blank"} href={"https://www.toysfortots.org"}>
                {truncate("interested. ", 25)}
            </StyledLink>
              
              View the certified contract on <StyledLink target={"_blank"} href={"https://polygonscan.com/address/0x385e5a6a3631cc2c093e274b31be3f1f572c7211"}>
                {truncate(" PolyScan", 25)}
            </StyledLink>

          </s.TextDescription>
          <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> This year I’m doing something new:
          </s.TextTitle>
          <s.TextDescription
            style={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          > I‘ve started the Ugly Xmas Sweater Club. We will give 55-40% of our club funds to Toys for Tots once the NFT minting has closed.
          </s.TextDescription>
          <s.SpacerSmall/>
          <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> Ugly Xmas Sweater Club Philanthropy
          </s.TextTitle>
          <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          > In addition to my regular annual donation, I’ve designed this unique collection of Non-fungible Tokens (NFTs) to look like ugly Christmas sweaters. 
          To mint a Ugly Xmas Sweater Club NFT (UxmasC token), connect to Polygon mainnet and click the Mint button. At the end of the Mint phase, (55% – 40%) 
          of the accumulated tokens exchanged for UxmasC will go to Toys for Tots.
          Minting is done via the Polygon blockchain and costs 14.8 MATIC (roughly $25 at the time the article was written) Since the NFTs are minted on Polygon, 
          gas fees are tiny. To connect to the Polygon mainnet, add the network: 
          <StyledLink target={"_blank"} href={"https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/"}>
                {truncate(" Config Metamask ", 25)}
            </StyledLink>
          
        </s.TextDescription>  
        <s.SpacerSmall/>
        <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          > A minimum of 100 must be minted before any prize can be given to a club member. The Toys for Tots donation is determined by the number minted and owned. The ultimate goal is to mint 4000 NFTs and donate $40,000 to Toys for Tots. 
          Then donate 15% of the club funds to a random club member.  Refer to the table for the specific tiers.
          </s.TextDescription>
          <s.SpacerSmall/>
          <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> What is the Ugly Xmas Sweater Club?
          </s.TextTitle>
          <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          > The Ugly Xmas Sweater Club is a collection of 4000 unique NFTs with varying degrees of rarity. Any wallet holding at least one Ugly Xmas Sweat Club (UxmasC) token, is considered in “the club.” Club members can win the prize. Club members can vote on the use of club resources after accounting and administration fees have been deducted.
          The club gains 45% of the tokens accumulated from the minting of the Ugly Sweaters. This amount is first used for accounting and administration. Actions that fall under accounting and administration include, but are not limited to these:
          </s.TextDescription>
          <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >    + Gas fees and Transaction fees    
          </s.TextDescription>
          <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >    + Taxes and Accounting   
           </s.TextDescription>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >   + Hosting and Development costs   
           </s.TextDescription>
           <s.SpacerSmall/>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >     Once accounting and administration has been deducted, 
          the remaining pool of tokens is controlled by the club. What happens to it will be 
          voted on based on prompts by me, the club creator. Suggestions might include ideas like these:
  
           </s.TextDescription>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >    +  Distribute or more gifts
           </s.TextDescription>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >    +  Develop more utility or a new project
           </s.TextDescription>
           <s.SpacerSmall/>
           <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> Ugly Xmas Sweater Club Gift
          </s.TextTitle>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >   One random club member will receive a gift between 3% and 15% of the accumulated tokens at the time of donation distribution. The value of the accumulated tokens (MATIC, ETH, WETH) can fluctuate, so no exact value can be placed on the gift at this time. The gift will be paid out in a token of which is to be determined, but could be a combination of MATIC, WETH (wrapped eth on polygon) or ETH since those are the tokens accepted in exchange for UxmasC NFTs.
          The club member receiving the gift will be selected at random. A “club member” is any wallet that holds at least one UxmasC token.
           </s.TextDescription>
           <s.SpacerSmall/>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
            > A random number generator will be used to select one of the minted Ugly Xmas Sweater Club NFTs’ number. For example, if 323 is selected, Ugly Xmas Sweater Club #323 NFTs’ holder will receive the gift.
              The gift will be given after the donation has been distributed,  and once  authorization has been given by the club accounting and administration or club creator.
           </s.TextDescription>
           <s.SpacerSmall/>

           <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> Ugly Xmas Sweater Club NFTs
          </s.TextTitle>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >   
          A maximum of 4000 NFTs can be minted. Each NFT is unique and created by combining up to 8 of 13 layers. 
          Rarity has no impact on a club member's chance of recieving a gift.
          Each layer is assigned a rarity, and an NFT is not guaranteed to contain any specific layer. 
          NFTs with less than 8 layers can be extremely rare.
          The basic layers are as follows:
          <s.Container jc={"center"} ai={"center"} style={{ width: "100%", align:"center"}}>
          
          <ListGroup>
              <ListGroup.Item>Backgrounds</ListGroup.Item>
              <ListGroup.Item>Sweater Shirt</ListGroup.Item>
              <ListGroup.Item>Patterns</ListGroup.Item>
              <ListGroup.Item>Bottom</ListGroup.Item>
              <ListGroup.Item>Collars</ListGroup.Item>
              <ListGroup.Item>Sweater Bottoms</ListGroup.Item>
              <ListGroup.Item>Top</ListGroup.Item>
              <ListGroup.Item>WristCuffs</ListGroup.Item>
          </ListGroup>
          </s.Container>
        The rarity for NFTs with fewer layers is as follows:
        
          <ListGroup>
              <ListGroup.Item>2900/4000 have all 8 layers</ListGroup.Item>
              <ListGroup.Item>600/4000 have no Patterns</ListGroup.Item>
              <ListGroup.Item>400/4000 have no bottom</ListGroup.Item>
              <ListGroup.Item>90/4000 have no top</ListGroup.Item>
              <ListGroup.Item>9/4000 have no pattern or bottom</ListGroup.Item>
              <ListGroup.Item>1/4000 has no bottom or top</ListGroup.Item>
          </ListGroup>
          </s.TextDescription>
          <s.SpacerSmall/>
           <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:28,
              width: "70%"
            }}> Balanced Layer Sets
          </s.TextTitle>
           <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >   All layers are assigned a rarity; however, certain layer sets are rebalanced for creating the 
          smaller NFT groups. For example, the 1/4000 NFT group uses layer sets with a balanced rarity to 
          prevent the most common layers from having the highest chance of being selected.
          All layers in the balanced layer sets have an equal rarity making their composition truly random.           
          
        
          </s.TextDescription>
          <s.SpacerSmall/>
          <s.TextDescription
            style={{
             // textAlign: "center",
              color: "var(--primary-text)",
              size:26,
              width: "70%"
            }}
          >   Additionally, some layers have been removed from the balanced layer sets. 
          In some cases, the most common and most rare layers in the non-balanced sets have been 
          removed from the balanced sets. For example, the yellow collar has been removed from the 
          balanced collar layer set since it is the rarest collar.   
          </s.TextDescription>
          <s.TextTitle style ={{
              //textAlign: "center",
              color: "var(--primary-text)",
              size:30,
              width: "70%"
            }}> The NFTs were created using the HashLips Art Engine. <StyledLink target={"_blank"} href={"https://www.youtube.com/watch?v=fzH7Gjadmj0&t=7501s"}>
            {truncate(" YouTube ", 25)}
        </StyledLink>
          </s.TextTitle>
          
        <s.SpacerSmall/>


      </s.Container>
    </s.Screen>
  );
}

export default App;
