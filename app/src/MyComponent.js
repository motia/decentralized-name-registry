import React from "react";
import { newContextComponents } from "@drizzle/react-components";
import logo from "./logo.png";
import {NameEntryForm} from "./NameEntryForm";

const { AccountData, ContractData, ContractForm } = newContextComponents;

export default ({ drizzle, drizzleState }) => {
  // destructure drizzle and drizzleState from props
  return (
    <div className="App">
      <div>
        <img src={logo} alt="drizzle-logo" />
        <h1>Drizzle Examples</h1>
        <p>
          Examples of how to get started with Drizzle in various situations.
        </p>
      </div>

      <div className="row">
        <div className="col">
            <div className="card">
                <div className="card-content">
                    <NameEntryForm
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        initialText={''}
                        projectId={}
                    />
                </div>
            </div>
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
  );
};
