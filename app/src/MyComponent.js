import React from "react";
import {newContextComponents} from "@drizzle/react-components";
import {NameEntryForm} from "./NameEntryForm";

const {AccountData, ContractData} = newContextComponents;

export default ({drizzle, drizzleState}) => {
    // destructure drizzle and drizzleState from props
    return (
        <div className="App">
            <div className="row">
                <div className="col">
                    <div className="title is-4">
                        Register new name
                    </div>

                    <NameEntryForm
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        initialText={''}
                    />

                    <div className="title is-4">
                        Registered Names
                    </div>

                    return <div>
                    <ContractData
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract='NameRegistery'
                        method="fetchPage"
                        methodArgs={[drizzle.accounts[0]]}
                        render={function (items) {
                            if (!items) {
                                return <div>Could not load names..</div>
                            }
                            return <div>
                                {
                                    items.map(address => <div className="card mb-5" key={address}>
                                        <div className="card-content">
                                            <NameEntryForm
                                                drizzle={drizzle}
                                                drizzleState={drizzleState}
                                                initialText={''}
                                            />
                                        </div>
                                    </div>)
                                }
                            </div>
                        }}
                    />
                </div>

                    <div className="col is-4-tablet is-3-desktop">
                        <h2>Active Account</h2>
                        <AccountData
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                            accountIndex={0}
                            units="ether"
                            precision={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
