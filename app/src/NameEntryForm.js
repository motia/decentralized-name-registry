import React, {useState} from 'react';
import {newContextComponents} from "@drizzle/react-components";

const {ContractForm} = newContextComponents;

const BLOCK_RESERVATION_COST = 1;

export function NameEntryForm({
                                  drizzleState,
                                  drizzle,
                                  initialText,
                              }) {
    const [text, setText] = useState((initialText || '').trim());
    const [investmentAmount, setInvestmentAmount] = useState();

    return <>
        <div className="card mt-4">
            <div className="card-content">
                <ContractForm
                    drizzle={drizzle}
                    drizzleState={drizzleState}
                    contract="NameRegistry"
                    method="invest"
                    sendArgs={{value: investmentAmount, from: drizzleState.accounts[0], gaz: 5.4 * 1000 * 1000}}
                    render={({inputs, inputTypes, state, handleInputChange, handleSubmit}) => {
                        const max = 100;
                        if (max === 0) {
                            return <div className="message">
                                <div className="message-body">No enough cash. Stranger!</div>
                            </div>
                        }

                        return (
                            <form onSubmit={handleSubmit}>
                                <div className="field">
                                    <label className="label" htmlFor="investmentAmount">
                                        Name
                                    </label>

                                    <div className="control">
                                        <input
                                            style={{maxWidth: '280px'}}
                                            className="input"
                                            name="name"
                                            required
                                            type="text"
                                            value={text}
                                            onChange={(event) => {
                                                setText(
                                                    event.target.value
                                                );
                                                handleInputChange(event);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label" htmlFor="investmentAmount">
                                        Number of blocks
                                    </label>

                                    <div className="control">
                                        <input
                                            style={{maxWidth: '280px'}}
                                            name="expires_after"
                                            className="input"
                                            required
                                            type="number"
                                            step="1"
                                            min="1"
                                            max={max}
                                            onChange={(event) => {
                                                setInvestmentAmount(
                                                    event.target.value
                                                        ? parseInt(event.target.value) * BLOCK_RESERVATION_COST
                                                        : 0
                                                );
                                                handleInputChange(event);
                                            }}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="button is-primary">Submit</button>
                            </form>
                        );
                    }}
                />
                }
            </div>
        </div>
    </>;
}
