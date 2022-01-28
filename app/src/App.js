import React from "react";
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle, generateStore } from "@drizzle/store";
import drizzleOptions from "./drizzleOptions";
import MyComponent from "./MyComponent";
import "./App.css";
import {AppLayout} from "./AppLayout";
// import logger from "redux-logger";


const store = generateStore({
    drizzleOptions,
    appMiddlewares: [
        // logger
    ],
});
const drizzle = new Drizzle(drizzleOptions, store);

const App = () => {
  return (
    <DrizzleContext.Provider drizzle={drizzle}>
        <AppLayout>
            <DrizzleContext.Consumer>
                {drizzleContext => {
                    const { drizzle, drizzleState, initialized } = drizzleContext;

                    if (!initialized) {
                        return "Loading..."
                    }

                    return (
                        <MyComponent drizzle={drizzle} drizzleState={drizzleState} />
                    )
                }}
            </DrizzleContext.Consumer>
        </AppLayout>
    </DrizzleContext.Provider>
  );
}

export default App;
