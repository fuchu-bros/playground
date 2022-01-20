import React from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';

import {getStacks, setStacks} from "./firebase/firestore";

const App = () => {
    const [stackData, setStackData] = React.useState({});
    const [dataStatus, setDataStatus] = React.useState(0);

    const updateQuery = (e) => {
        e.preventDefault();
        const id = moment().format('YYYYMM');
        setStacks(id, {}).then((result) => {
            console.log("Update result", result);
            setDataStatus(0);
        })
    }

    // read excel
    React.useEffect(async () => {
        
    }, []);

    // get firestore
    React.useEffect(async () => {
        if (dataStatus === 1) return;
        console.log("Get New Data");
        const data = await getStacks();
        const keys = Object.keys(data);
        let stacks = {};
        keys.forEach(d => {
            const year = d.slice(0, 4);
            const month = d.slice(4);

            if (stacks.hasOwnProperty(year) === false) {
                stacks = {
                    ...stacks,
                    [year]: {}
                }
            }

            stacks[year] = {
                ...stacks[year],
                [month]: data[d]
            };
        });
        setStackData(stacks);
        setDataStatus(1);
    }, [dataStatus]);

    // Render
    if (Object.keys(stackData).length === 0) return <div>Loading...</div>;
    return (
        <>
            <div>Hello!!</div>
            {Object.keys(stackData).map(year => {
                return <h2 key={`year_${year}`}>{year}</h2>;
            })}

            <div>
                <textarea cols="100" rows="20"></textarea><br/>
                <button onClick={updateQuery}>Update!!</button>
            </div>
        </>
    );
};

ReactDOM.render(<App />, document.querySelector('#app'));