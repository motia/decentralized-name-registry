import React, {useEffect, useState} from "react";
import {newContextComponents} from "@drizzle/react-components";
import {NameEntryForm} from "./NameEntryForm";
import AppAction from "./AppAction";

const {ContractData} = newContextComponents;

function NameEntryFormModal({nameEntryConfig, drizzle, drizzleState, currentBlockNumber: currentBlockNumber, onClose}) {
    return <div className={`modal ${nameEntryConfig ? 'is-active' : ''}`}>
        <div className="modal-background"/>
        <div className="modal-content">
            {nameEntryConfig &&
                <>
                    <NameEntryForm
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        initialText={nameEntryConfig.initialText}
                        initialExpiryBlock={nameEntryConfig.initialExpiryBlock}
                        method={nameEntryConfig.method}
                        currentBlockNumber={currentBlockNumber}
                    />
                </>
            }
        </div>
        <button className="modal-close is-large" aria-label="close"
                onClick={onClose}
        />
    </div>;
}

export default ({drizzle, drizzleState}) => {
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);

    // TODO: replace with subscription
    useEffect(() => {
        let destroyed = false;
        drizzle.web3.eth.getBlockNumber().then(
            (bn) => destroyed ? null : setCurrentBlockNumber(bn)
        );

        const interval = setInterval(async () => {
            setCurrentBlockNumber(await drizzle.web3.eth.getBlockNumber());
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
            <NameEntryFormModal
                drizzle={drizzle}
                drizzleState={drizzleState}
                nameEntryConfig={nameEntryConfig}
                onClose={() => setNameEntryConfig(null)}
                currentBlockNumber={currentBlockNumber}
            />

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
                                    <AppAction
                                        drizzle={drizzle}
                                        drizzleState={drizzleState}
                                        onRegister={() => {
                                            setNameEntryConfig({
                                                initialText: '',
                                                initialExpiryBlock: currentBlockNumber,
                                                method: 'register',
                                            })
                                        }}
                                    />
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
                                                        const isRenewable = item.expires_at >= currentBlockNumber;
                                                        const isCancelable = item.expires_at > currentBlockNumber;
                                                        const isExpired = item.expires_at < currentBlockNumber;

                                                        return <div className="card mb-5 renew-card" key={item}>
                                                            <div className="card-content">
                                                                <div className="level is-mobile">
                                                                    <div className="level-left">
                                                                        <div>
                                                                            <div
                                                                                className="has-text-weight-bold has-big-font">
                                                                                {name}
                                                                            </div>
                                                                            <div
                                                                                className="has-text-grey has-small-font">
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
                                                                                                 initialExpiryBlock: Math.max(currentBlockNumber, item.expires_at),
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
                                                                                             initialExpiryBlock: item.expires_at,
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
                            {/*<div className="card  mb-4">*/}
                            {/*    <div className="card-content" style={{overflow: 'hidden'}}>*/}
                            {/*        <div className="title">Active Account</div>*/}
                            {/*        <AccountData*/}
                            {/*            drizzle={drizzle}*/}
                            {/*            drizzleState={drizzleState}*/}
                            {/*            accountIndex={0}*/}
                            {/*            units="ether"*/}
                            {/*            precision={3}*/}
                            {/*        />*/}
                            {/*    </div>*/}
                            {/*</div>*/}


                            <div className="card mb-4">
                                <div className="card-content">
                                    <ContractData
                                        drizzle={drizzle}
                                        drizzleState={drizzleState}
                                        contract='NameToken'
                                        method="balanceOf"
                                        methodArgs={[drizzleState.accounts[0]]}
                                        render={(b) =>
                                            <>
                                                {/*TODO: fix balance update after transactions*/}
                                                <div className="heading">Balance</div>
                                                <div style={{fontSize: '20px'}}>
                                                    <div className="has-text-weight-bold">{b} NBT</div>
                                                </div>
                                                <br/>
                                                <div className="heading">Block</div>
                                                <div style={{fontSize: '20px'}}>{currentBlockNumber}</div>
                                            </>

                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
