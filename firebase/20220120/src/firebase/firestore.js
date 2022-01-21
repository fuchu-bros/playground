const firebaseApp = require('./firebase');
const {getFirestore, collection, getDocs, setDoc, doc} = require('firebase/firestore');

const db = getFirestore(firebaseApp);
const __STACKS__ = "stacks";
const __RAWDATA__ = "rowdata";

const firestoreFunc = {
    getStacks: async () => {
        let stackData = {};
        const snapShot = await getDocs(collection(db, __STACKS__));
        snapShot.forEach(doc => {
            if (doc.id.length === 6) {
                stackData = {
                    ...stackData,
                    [doc.id]: doc.data()
                };
            }
        });
        return stackData;
    },
    setStacks: async (id, data = {}) => {
        console.log(id, data);
        await setDoc(doc(db, __STACKS__, id), {
            time: new Date().getTime(),
            data: JSON.stringify(data)
        });
        return true;
    },
    addRawData: async (data = {}) => {
        return await setDoc(doc(db, __RAWDATA__), data);
    }
}

module.exports = firestoreFunc;


