const firebaseApp = require('./firebase');
const {getFirestore, collection, getDocs, setDoc, doc} = require('firebase/firestore');

const db = getFirestore(firebaseApp);
const __COLLECTION__ = "stacks";

const firestoreFunc = {
    getStacks: async () => {
        let stackData = {};
        const snapShot = await getDocs(collection(db, __COLLECTION__));
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
        await setDoc(doc(db, __COLLECTION__, id), {
            time: new Date().getTime(),
            data: JSON.stringify(data)
        });
        return true;
    }
}

module.exports = firestoreFunc;


