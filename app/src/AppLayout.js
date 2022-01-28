import React from "react";
// @ts-ignore
import {DrizzleContext} from "@drizzle/react-plugin";

export function AppLayout({children,}) {
    return <DrizzleContext.Consumer>
        {(drizzleContext) =>
            <StatusDisplay drizzleContext={drizzleContext}>{children}</StatusDisplay>
        }
    </DrizzleContext.Consumer>
}


const StatusDisplay = function (
    {
        drizzleContext: {drizzle, drizzleState, initialized},
        children
    }
) {
    // @ts-ignore
    window.drizzle = drizzleState;
    // @ts-ignore
    window.drizzleState = drizzleState;

    if (initialized) {
        const web3 = drizzle.web3;
        if (web3.status === "failed") {
            return (
                <div className="hero is-fullheight has-background-light">
                    <div className="hero-body">
                        <div className="has-text-centered">
                            <div className="title has-text-danger">
                                <span role="img" aria-label="error">⚠</span>
                            </div>
                            <div>
                                This browser has no connection to the Ethereum network.
                                <br/>
                                Please use the Chrome/FireFox extension MetaMask, or dedicated
                                Ethereum browsers.
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (web3.status === "UserDeniedAccess") {
            return (
                <div className="hero is-fullheight has-background-light">
                    <div className="hero-body">
                        <div className="has-text-centered">
                            <div className="title has-text-warning">
                                <span role="img" aria-label="MetaMask">🦊</span>
                            </div>
                            <div>
                                <strong>{"We can't find any Ethereum accounts!"}</strong>
                                Please Make sure to connect one of your accounts to the dapp.
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (
            web3.status === "initialized" &&
            (web3.NetworkMismatch || Object.keys(drizzleState.accounts).length === 0)
        ) {
            return (
                <div className="hero is-fullheight has-background-light">
                    <div className="hero-body">
                        <div className="has-text-centered">
                            <div className="title has-text-warning">
                                <span role="img" aria-label="MetaMask">🦊</span>
                            </div>
                            <div>
                                <strong>{"We can't find any Ethereum accounts!"}</strong>
                                <br/>
                                Please check and make sure Metamask or your browser Ethereum
                                wallet is pointed at the correct network and your account is
                                unlocked.
                                <br/> The following networks are allowed : Ropsten
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }

    return  <div className="hero is-fullheight has-background-light">
        <div className="hero-body">
            <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    </div>;
}
