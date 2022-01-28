import React, {useEffect, useState} from 'react';
import {newContextComponents} from "@drizzle/react-components";

const {ContractForm} = newContextComponents;

const BLOCK_RESERVATION_COST = 1;

function capitalize(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' ');
}

export function NameEntryForm({
                                  drizzleState,
                                  drizzle,
                                  initialText,
                                  method
                              }) {
    const [text, setText] = useState((initialText || '').trim());
    const [numberOfBlocks, setNumberOfBlocks] = useState('0');
    const [transactionStatus, setTransactionStatus] = useState('');

    return <>
        <div className="card mt-4">
            <div className="card-content">
                <div className="title is-4">
                    {capitalize(method)} name
                </div>

                <ContractForm
                    drizzle={drizzle}
                    drizzleState={drizzleState}
                    contract='NameRegistry'
                    method={method}
                    sendArgs={{value: numberOfBlocks * BLOCK_RESERVATION_COST, gas: 1000 * 1000}}
                    render={({inputs, inputTypes, state, handleInputChange, handleSubmit}) => {
                        const max = 100;

                        return (
                            <form onSubmit={(e) => {
                                e.persist();
                                e.preventDefault();

                                if (numberOfBlocks > max) {
                                    return;
                                }

                                handleInputChange({
                                    target: {
                                        name: 'name',
                                        type: 'text',
                                        value: text
                                    }
                                });

                                handleInputChange({
                                    target: {
                                        name: 'expires_after',
                                        type: 'number',
                                        value: parseInt(numberOfBlocks)
                                    }
                                });

                                const listenToTransactionStatus = (transactionStackIdx) => {
                                    // TODO: use subscription from store instead
                                    const interval = setInterval(() => {
                                        const item = drizzleState.transactions[
                                            drizzleState.transactionStack[transactionStackIdx]
                                        ];

                                        setTransactionStatus(item.status);
                                    }, 3000);
                                }

                                setTimeout(() => {
                                    const transactionStackIdx = handleSubmit(e);

                                    listenToTransactionStatus(transactionStackIdx);
                                });
                            }}>
                                <div className="columns">
                                    <div className="column is-8">
                                        <div className="field">
                                            <label className="label" htmlFor="numberOfBlocks">
                                                Name
                                            </label>

                                            <div className="control">
                                                <input
                                                    className="input"
                                                    name="name"
                                                    required
                                                    type="text"
                                                    value={text}
                                                    readOnly={!!initialText}
                                                    onChange={(event) => {
                                                        if (initialText) return;

                                                        setText(
                                                            event.target.value
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="column is-4">
                                        <div className="field">
                                            <label className="label" htmlFor="numberOfBlocks">
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
                                                    value={numberOfBlocks}
                                                    onChange={(event) => {
                                                        setNumberOfBlocks(
                                                            `${event.target.value
                                                                ? parseInt(event.target.value) * BLOCK_RESERVATION_COST
                                                                : 0}`
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <button type="submit" className="button is-primary"
                                    disabled={numberOfBlocks > max}
                                >Submit</button>
                            </form>
                        );
                    }}
                />
            </div>
        </div>
    </>;
}
