import React, {useEffect, useState} from "react";
import {newContextComponents} from "@drizzle/react-components";
import {NameEntryForm} from "./NameEntryForm";

const {AccountData, ContractData} = newContextComponents;

export default ({drizzle, drizzleState}) => {
    const [blockNumber, setBlockNumber] = useState(0);

    // TODO: replace with subscription
    useEffect(() => {
        let destroyed = false;
        drizzle.web3.eth.getBlockNumber().then(
            (bn) => destroyed ? null : setBlockNumber(bn)
        );

        const interval = setInterval(async () => {
            setBlockNumber(await drizzle.web3.eth.getBlockNumber());
        }, 5000);

        return () => {
            destroyed = true;
            clearInterval(interval);
        }
    }, []);
    window.appDrizzle = drizzle;
    const [nameEntryConfig, setNameEntryConfig] = useState(null);

    // destructure drizzle and drizzleState from props
    return (
        <div className="App">
            <div className={`modal ${nameEntryConfig ? 'is-active' : ''}`}>
                <div className="modal-background"></div>
                <div className="modal-content">
                    {nameEntryConfig &&
                        <>
                            <NameEntryForm
                                drizzle={drizzle}
                                drizzleState={drizzleState}
                                initialText={nameEntryConfig.initialText}
                                method={nameEntryConfig.method}
                            />
                        </>
                    }
                </div>
                <button className="modal-close is-large" aria-label="close"
                        onClick={() => setNameEntryConfig(null)}
                ></button>
            </div>

            <div className="section">
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <div className="level is-mobile">
                                <div className="level-left">
                                    <div className="title is-4">
                                        Registered Names
                                    </div>
                                </div>
                                <div className="level-right">
                                    <button className="button is-primary is-outlined" onClick={() => {
                                        setNameEntryConfig({
                                            initialText: '',
                                            method: 'register',
                                        })
                                    }}>
                                        Register new
                                    </button>
                                </div>
                            </div>


                            <div>
                                <ContractData
                                    drizzle={drizzle}
                                    drizzleState={drizzleState}
                                    contract='NameRegistry'
                                    method="fetchUserRegisteredNames"
                                    render={function (items) {
                                        const account = drizzleState.accounts[0];
                                        if (!items) {
                                            return <div>No names registered..</div>
                                        }

                                        return <div>
                                            {
                                                items.filter(item => item.owner === account)
                                                    .map(item => {
                                                        const name = drizzle.web3.utils.hexToAscii(item.name).replaceAll('\x00', '');
                                                        const isRenewable = item.expires_at >= blockNumber;
                                                        const isCancelable = item.expires_at > blockNumber;
                                                        const isExpired = item.expires_at < blockNumber;

                                                        return <div className="card mb-5 renew-card" key={item}>
                                                            <div className="card-content">
                                                                <div className="level is-mobile">
                                                                    <div className="level-left">
                                                                        <div>
                                                                            <div
                                                                                className="has-text-weight-bold has-big-font">
                                                                                {name}
                                                                            </div>
                                                                            <div className="has-text-grey has-small-font">
                                                                                expires at: {item.expires_at}
                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                    <div className="level-right">
                                                                        <div className="tags">

                                                                        {
                                                                            isRenewable ?
                                                                            <div className="tag is-info"
                                                                                 onClick={() => {
                                                                                     setNameEntryConfig({
                                                                                         method: 'renew',
                                                                                         initialText: name,
                                                                                     })
                                                                                 }}
                                                                            >renew
                                                                            </div> :
                                                                            <div className="tag is-info"
                                                                                 onClick={() => {
                                                                                     setNameEntryConfig({
                                                                                         method: 'register',
                                                                                         initialText: name,
                                                                                     })
                                                                                 }}
                                                                            >register
                                                                            </div>
                                                                        }
                                                                        {
                                                                            isCancelable &&
                                                                            <div className="tag is-danger"
                                                                                 onClick={() => {
                                                                                     setNameEntryConfig({
                                                                                         method: 'cancel',
                                                                                         initialText: name,
                                                                                     })
                                                                                 }}
                                                                            >cancel
                                                                            </div>
                                                                        }
                                                                        {
                                                                            isExpired &&
                                                                            <div className="tag">expired</div>
                                                                        }
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>;
                                                    })
                                            }
                                        </div>
                                    }}
                                />
                            </div>

                        </div>
                        <div className="column is-4-tablet is-3-desktop">
                            <div className="card">
                                <div className="card-content" style={{overflow: 'hidden'}}>
                                    <div className="title">Active Account</div>
                                    <AccountData
                                        drizzle={drizzle}
                                        drizzleState={drizzleState}
                                        accountIndex={0}
                                        units="ether"
                                        precision={3}
                                    />
                                </div>

                            </div>

                            <div className="card mt-4">
                                <div className="card-content">
                                    <div>
                                        <div className="title is-4 is-marginless">Current block</div>
                                        <div style={{fontSize: '20px'}}>{blockNumber}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
