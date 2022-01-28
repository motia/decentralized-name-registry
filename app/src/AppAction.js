import React, {useEffect, useState} from "react";
import {newContextComponents} from "@drizzle/react-components";
import NameRegistry from "./contracts/NameRegistry.json";
import {drizzleReactHooks} from "@drizzle/react-plugin";

const {useDrizzleState} = drizzleReactHooks;

const {ContractData, ContractForm} = newContextComponents;

export default ({drizzle, drizzleState, onRegister}) => {
    const networkId = drizzleState.web3 && drizzleState.web3.networkId;
    console.log(drizzleState, drizzle)

    return <ContractData
        drizzle={drizzle}
        drizzleState={drizzleState}
        contract='NameToken'
        method="allowance"
        methodArgs={[drizzleState.accounts[0], NameRegistry.networks[networkId].address]}
        render={function (approved) {
            if (`${approved}` === '0') {
                return <button className="button is-primary is-outlined" onClick={() => {
                    window.appDrizzle.contracts.NameToken.methods.approve(
                        NameRegistry.networks[networkId].address,
                        1000000000
                    ).send()
                }}>
                    Approve
                </button>
            } else {
                return <button className="button is-primary is-outlined" onClick={onRegister}>
                    Register new
                </button>
            }
        }}
    />
}
