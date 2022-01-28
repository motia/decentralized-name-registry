import React, {Component} from "react";
import PropTypes from "prop-types";
import {newContextComponents} from "@drizzle/react-components";

const {ContractData} = newContextComponents;

class DynamicContract extends Component {
    constructor(props) {
        super(props);

        var contractConfig = {
            contractName: this.props.contract || this.props.address,
            web3Contract: new props.drizzle.web3.eth.Contract(
                this.props.abi,
                this.props.address,
                this.props.options
            )
        };

        if (!this.props.drizzle.contracts[this.props.contract]) {
            props.drizzle.addContract(contractConfig, this.props.events);
        }
    }

    render() {
        try {
            // Contract is not yet initialized.
            if (
                !this.props.drizzleState.contracts[this.props.contract || this.props.address] ||
                !this.props.drizzleState.contracts[this.props.contract || this.props.address].initialized
            ) {
                return (<span>Initializing...</span>);
            }
            return this.props.method ? (
                    <ContractData
                        drizzle={this.props.drizzle}
                        drizzleState={this.props.drizzleState}
                        contract={this.props.contract || this.props.address}
                        method={this.props.method}
                        methodArgs={this.props.methodArgs}
                        sendArgs={this.props.sendArgs}
                        render={this.props.render}
                        hideIndicator={this.props.hideIndicator}
                        toUtf8={this.props.toUtf8}
                        toAscii={this.props.toAscii}
                    />
                )
                : this.props.render(this.props.contracts, this.props.contract || this.props.address);
        } catch (e) {
            console.log("ERROR in DynamicContract render", e);
            return (<div>ERROR: {e.message}</div>);
        }
    }
}

DynamicContract.propTypes = {
    abi: PropTypes.array.isRequired,
    options: PropTypes.object,
    events: PropTypes.object,

    drizzle: PropTypes.object.isRequired,
    drizzleState: PropTypes.object.isRequired,
    contract: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    methodArgs: PropTypes.array,
    hideIndicator: PropTypes.bool,
    toUtf8: PropTypes.bool,
    toAscii: PropTypes.bool,
    render: PropTypes.func,
};

// ContractData.propTypes = {
//     drizzle: PropTypes.object.isRequired,
//     drizzleState: PropTypes.object.isRequired,
//     contract: PropTypes.string,
//     method: PropTypes.string.isRequired,
//     methodArgs: PropTypes.array,
//     hideIndicator: PropTypes.bool,
//     toUtf8: PropTypes.bool,
//     toAscii: PropTypes.bool,
//     render: PropTypes.func,
// };

export default DynamicContract;
