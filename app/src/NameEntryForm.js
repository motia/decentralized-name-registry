import React, {useEffect, useState} from 'react';
import {newContextComponents} from "@drizzle/react-components";

const {ContractForm} = newContextComponents;

const BLOCK_RESERVATION_COST = 10;

function capitalize(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' ');
}

export function NameEntryForm({
                                  drizzleState,
                                  drizzle,
                                  initialText,
                                  initialExpiryBlock,
                                  method,
                                  currentBlockNumber,
                              }) {
    const [name, setName] = useState((initialText || '').trim());
    const [targetExpiryBlock, setTargetExpiryBlock] = useState(`${initialExpiryBlock || 0}`);
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

    const numberOfBlocks = method === 'cancel'
        ? (initialExpiryBlock - currentBlockNumber)
        : (targetExpiryBlock - Math.max(currentBlockNumber, initialExpiryBlock));

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
                                Name `{name}` {method}ed successfully
                            </div>
                        </div>
                    : <ContractForm
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract='NameRegistry'
                        method={method}
                        sendArgs={{gas: 1000 * 1000}}
                        render={({handleInputChange, handleSubmit}) => {
                            return (
                                <form onSubmit={(e) => {
                                    e.persist();
                                    e.preventDefault();

                                    handleInputChange({
                                        target: {
                                            name: 'name',
                                            type: 'text',
                                            value: name
                                        }
                                    });

                                    if (method !== 'cancel') {
                                        handleInputChange({
                                            target: {
                                                name: 'expires_after',
                                                type: 'number',
                                                value: parseInt(targetExpiryBlock) - parseInt(currentBlockNumber)
                                            }
                                        });
                                    }

                                    setTimeout(() => {
                                        setTransactionStatus('pending');
                                        setTransactionStackIdx(handleSubmit(e));
                                    });
                                }}>
                                    <div className="columns mb-0">
                                        <div className="column">
                                            <div className="field">
                                                <label className="label" htmlFor="targetExpiryBlock">
                                                    Name
                                                </label>

                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        name="name"
                                                        required
                                                        type="text"
                                                        value={name}
                                                        readOnly={!!initialText}
                                                        onChange={(event) => {
                                                            if (initialText) return;

                                                            setName(
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
                                                    <label className="label" htmlFor="targetExpiryBlock">
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
                                                            min={Math.max(currentBlockNumber, initialExpiryBlock)}
                                                            value={targetExpiryBlock}
                                                            onChange={(event) => {
                                                                setTargetExpiryBlock(
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


                                    <div className='has-text-grey has-small-font mb-3'>
                                        {method === 'cancel' ? 'Refund' : 'Pay'} {numberOfBlocks*BLOCK_RESERVATION_COST} <span className='has-text-weight-bold'>NBT</span> for {numberOfBlocks} blocks
                                    </div>
                                    {
                                        transactionStatus === 'error' && <div className="has-text-danger mb-3">
                                            Transaction failed
                                        </div>
                                    }

                                    <button type="submit"
                                            className={`button is-primary ${transactionStatus === 'pending' ? 'is-loading' : ''}`}
                                            disabled={numberOfBlocks === 0 || transactionStatus === 'pending'}
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
