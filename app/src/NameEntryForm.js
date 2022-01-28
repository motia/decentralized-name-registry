import React, {useEffect, useState} from 'react';
import {newContextComponents} from "@drizzle/react-components";

const {ContractForm} = newContextComponents;

const BLOCK_RESERVATION_COST = 1000;

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
    const [transactionStackIdx, setTransactionStackIdx] = useState(null);

    useEffect(() => {
            // TODO: use subscription from store instead
            const interval = setInterval(() => {
                if (transactionStackIdx === null) {
                    return;
                }
                const txHash = drizzleState.transactionStack[transactionStackIdx];

                const item = drizzleState.transactions[txHash];

                const hasError = Object.keys(drizzleState.transactions)
                    .find(x => {
                        if (!x.startsWith('TEMP_')) {
                            return false;
                        }
                        let transaction = drizzleState.transactions[x];
                        return  transaction.error.message.includes(txHash);
                    })

                const newVar = hasError ? 'error' : (item ? item.status : 'pending');
                if (newVar !== 'pending') {
                    clearInterval(interval);
                }
                setTransactionStatus(newVar);
            }, 1000);

            return () => clearInterval(interval);
    }, [drizzleState, transactionStackIdx]);

    const bid = method === 'cancel'
        ? undefined
        : numberOfBlocks * BLOCK_RESERVATION_COST;

    return <>
        <div className="card mt-4">
            <div className="card-content">
                <div className="title is-4">
                    {capitalize(method)} name
                </div>

                {
                    transactionStatus === 'success'
                        ? <div className="message is-success">
                            <div className="message-header">Success</div>
                            <div className="message-body">
                                Name `{text}` {method}ed successfully
                            </div>
                        </div>
                    : <ContractForm
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract='NameRegistry'
                        method={method}
                        sendArgs={{value: bid, gas: 1000 * 1000}}
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

                                    setTimeout(() => {
                                        setTransactionStatus('pending');
                                        setTransactionStackIdx(handleSubmit(e));
                                    });
                                }}>
                                    <div className="columns">
                                        <div className="column">
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

                                        {
                                            method !== 'cancel' &&
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
                                                                        ? parseInt(event.target.value)
                                                                        : 0}`
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        }
                                    </div>

                                    {
                                        transactionStatus === 'error' && <div className="has-text-danger mb-3">
                                            Transaction failed
                                        </div>
                                    }


                                    <button type="submit"
                                            className={`button is-primary ${transactionStatus === 'pending' ? 'is-loading' : ''}`}
                                            disabled={numberOfBlocks > max || transactionStatus === 'pending'}
                                    >Submit</button>
                                </form>
                            );
                        }}
                    />
                }
            </div>
        </div>
    </>;
}
